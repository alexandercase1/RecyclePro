from sklearn.metrics import accuracy_score
import torch
from torchvision.datasets import ImageFolder
import torchvision.models as models
from torchvision.models import MobileNet_V3_Large_Weights
from torchvision.transforms import transforms
from torch.utils.data import DataLoader


def train(model, train_loader, val_loader, criterion, optimizer, num_epochs, patience=10):

    best_val_loss = float('inf')
    epochs_without_improvement = 0
    best_weights = None

    for epoch in range(num_epochs):
        # Set the model to training mode
        model.train()

        # Initialize running loss and correct predictions count for training
        running_loss = 0.0
        running_corrects = 0

        # Iterate over the training data loader
        for inputs, labels in train_loader:
            # Move inputs and labels to the device (GPU or CPU)
            inputs = inputs.to(device)
            labels = labels.to(device)

            # Reset the gradients to zero before the backward pass
            optimizer.zero_grad()

            # Forward pass: compute the model output
            outputs = model(inputs)
            # Get the predicted class (with the highest score)
            _, preds = torch.max(outputs, 1)
            # Compute the loss between the predictions and actual labels
            loss = criterion(outputs, labels)

            # Backward pass: compute gradients
            loss.backward()
            # Perform the optimization step to update model parameters
            optimizer.step()

            # Accumulate the running loss and the number of correct predictions
            running_loss += loss.item() * inputs.size(0)
            running_corrects += torch.sum(preds == labels.data)

        # Compute average training loss and accuracy for this epoch
        train_loss = running_loss / len(train_loader.dataset)
        train_acc = running_corrects.float() / len(train_loader.dataset)

        # Set the model to evaluation mode for validation
        model.eval()
        # Initialize running loss and correct predictions count for validation
        running_loss = 0.0
        running_corrects = 0

        # Disable gradient computation for validation (saves memory and computations)
        with torch.no_grad():
            # Iterate over the validation data loader
            for inputs, labels in val_loader:
                # Move inputs and labels to the device (GPU or CPU)
                inputs = inputs.to(device)
                labels = labels.to(device)

                # Forward pass: compute the model output
                outputs = model(inputs)
                # Get the predicted class (with the highest score)
                _, preds = torch.max(outputs, 1)
                # Compute the loss between the predictions and actual labels
                loss = criterion(outputs, labels)

                # Accumulate the running loss and the number of correct predictions
                running_loss += loss.item() * inputs.size(0)
                running_corrects += torch.sum(preds == labels.data)

        # Compute average validation loss and accuracy for this epoch
        val_loss = running_loss / len(val_loader.dataset)
        val_acc = running_corrects.float() / len(val_loader.dataset)

        # Print the results for the current epoch
        print(f'Epoch [{epoch+1}/{num_epochs}], train loss: {train_loss:.4f}, '
              f'train acc: {train_acc:.4f}, val loss: {val_loss:.4f}, val acc: {val_acc:.4f}')

        # Early Stop
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            epochs_without_improvement = 0
            best_weights = model.state_dict()
        else:
            epochs_without_improvement += 1
            if epochs_without_improvement >= patience:
                print(f"Stopping early at epoch {epoch+1}.")
                model.load_state_dict(best_weights)
                break


def evaluate_model(model, test_loader, device):
    # Initialize dictionaries to store correct and total predictions
    correct_pred = {classname: 0 for classname in test_loader.dataset.classes}
    total_pred = {classname: 0 for classname in test_loader.dataset.classes}

    # Set the model to evaluation mode
    model.eval()

    # Track the ground truth labels and predictions
    all_labels = []
    all_preds = []

    with torch.no_grad():
        for inputs, labels in test_loader:
            # Move the inputs and labels to the device
            inputs = inputs.to(device)
            labels = labels.to(device)

            # Forward pass
            outputs = model(inputs)
            _, preds = torch.max(outputs, 1)

            # Collect predictions and labels for metric calculations
            all_labels.extend(labels.cpu().numpy())
            all_preds.extend(preds.cpu().numpy())

            # Update the correct and total predictions
            for label, prediction in zip(labels, preds):
                classname = test_loader.dataset.classes[label]
                if label == prediction:
                    correct_pred[classname] += 1
                total_pred[classname] += 1

    # Calculate accuracy per class
    accuracy_per_class = {classname: correct_pred[classname] / total_pred[classname] if total_pred[classname] > 0 else 0
                          for classname in test_loader.dataset.classes}

    # Calculate overall accuracy
    overall_accuracy = accuracy_score(all_labels, all_preds)

    # Print the evaluation results
    print("Accuracy per class:")
    for classname, accuracy in accuracy_per_class.items():
        print(f"{classname}: {accuracy:.4f}")

    print()
    print(f"Overall Accuracy: {overall_accuracy:.4f}")


if __name__ == '__main__':
    device = torch.device("mps" if torch.backends.mps.is_available() else "cuda" if torch.cuda.is_available() else "cpu")
    print("Using device:", device)

    weights = MobileNet_V3_Large_Weights.DEFAULT
    model = models.mobilenet_v3_large(weights=weights)

    num_classes = 8
    model.classifier[3] = torch.nn.Linear(model.classifier[3].in_features, num_classes)

    train_transform = transforms.Compose([
        transforms.RandomResizedCrop(224),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    val_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    train_dataset = ImageFolder(r'dataset\merged\train', transform=train_transform)
    val_dataset = ImageFolder(r'dataset\merged\val', transform=val_transform)
    test_dataset = ImageFolder(r'dataset\merged\test', transform=val_transform)

    train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True, num_workers=4)
    val_loader = DataLoader(val_dataset, batch_size=64, shuffle=False, num_workers=4)
    test_loader = DataLoader(test_dataset, batch_size=64, shuffle=False, num_workers=4)

    criterion = torch.nn.CrossEntropyLoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=0.0001, weight_decay=0.01)

    model = model.to(device)
    train(model, train_loader, val_loader, criterion, optimizer, num_epochs=300)

    evaluate_model(model, test_loader, device)

    model.eval()
    dummy_input = (torch.randn(1, 3, 224, 224).to(device),)

    torch.onnx.export(
        model,
        dummy_input,
        "recycle_classify.onnx",
        input_names=["input"],
        output_names=["output"],
        opset_version=18,
        dynamic_axes={"input": {0: "batch"}, "output": {0: "batch"}}
    )
