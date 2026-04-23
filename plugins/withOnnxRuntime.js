const { withMainApplication, withAppBuildGradle } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

/**
 * Config plugin that handles all onnxruntime-react-native setup that expo
 * prebuild does not do automatically:
 *
 * 1. MainApplication.kt — injects OnnxruntimePackage (not autolinked)
 * 2. build.gradle       — adds pickFirsts for libreactnative.so conflicts
 * 3. Android assets     — copies ONNX model files into the APK asset directory
 */
const withOnnxRuntime = (config) => {
  config = withOnnxMainApplication(config);
  config = withOnnxBuildGradle(config);
  config = withOnnxAssets(config);
  return config;
};

// ── 1. MainApplication.kt ────────────────────────────────────────────────────

const withOnnxMainApplication = (config) => {
  return withMainApplication(config, (config) => {
    const contents = config.modResults.contents;
    if (contents.includes('OnnxruntimePackage')) return config;

    config.modResults.contents = contents
      .replace(
        'import expo.modules.ApplicationLifecycleDispatcher',
        'import ai.onnxruntime.reactnative.OnnxruntimePackage\nimport expo.modules.ApplicationLifecycleDispatcher'
      )
      .replace(
        'PackageList(this).packages.apply {',
        'PackageList(this).packages.apply {\n              add(OnnxruntimePackage())'
      );

    return config;
  });
};

// ── 2. build.gradle — pickFirsts for libreactnative.so ───────────────────────

const withOnnxBuildGradle = (config) => {
  return withAppBuildGradle(config, (config) => {
    const contents = config.modResults.contents;
    if (contents.includes('libreactnative.so')) return config;

    config.modResults.contents = contents.replace(
      'useLegacyPackaging enableLegacyPackaging.toBoolean()',
      `useLegacyPackaging enableLegacyPackaging.toBoolean()
            pickFirsts += [
                'lib/arm64-v8a/libreactnative.so',
                'lib/x86_64/libreactnative.so',
                'lib/x86/libreactnative.so',
                'lib/armeabi-v7a/libreactnative.so'
            ]`
    );

    return config;
  });
};

// ── 3. Android assets — copy model files ─────────────────────────────────────

const withOnnxAssets = (config) => {
  return {
    ...config,
    mods: {
      ...config.mods,
      android: {
        ...(config.mods?.android ?? {}),
        dangerous: async (config) => {
          const projectRoot = config.modRequest.projectRoot;
          const destDir = path.join(
            projectRoot,
            'android', 'app', 'src', 'main', 'assets', 'models'
          );

          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
          }

          const modelFiles = [
            { src: 'recycle_classify.onnx',     dest: 'recycle_classify.onnx' },
            { src: 'recycle_classify.onnxdata', dest: 'recycle_classify.onnx.data' },
          ];

          for (const { src, dest } of modelFiles) {
            const srcPath  = path.join(projectRoot, 'assets', 'models', src);
            const destPath = path.join(destDir, dest);
            if (fs.existsSync(srcPath)) {
              fs.copyFileSync(srcPath, destPath);
              console.log(`[withOnnxRuntime] Copied ${src} → android/app/src/main/assets/models/${dest}`);
            } else {
              console.warn(`[withOnnxRuntime] WARNING: ${srcPath} not found — model will not load on Android`);
            }
          }

          return config;
        },
      },
    },
  };
};

module.exports = withOnnxRuntime;
