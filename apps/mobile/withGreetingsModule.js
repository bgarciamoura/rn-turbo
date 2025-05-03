const {
  withDangerousMod,
  withMainApplication,
  // AndroidConfig não foi usado, pode remover se quiser
} = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

// Função de cópia permanece a mesma
function copyFolderRecursiveSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  fs.readdirSync(source).forEach((file) => {
    const curSource = path.join(source, file);
    const curTarget = path.join(target, file);
    if (fs.lstatSync(curSource).isDirectory()) {
      copyFolderRecursiveSync(curSource, curTarget);
    } else {
      fs.copyFileSync(curSource, curTarget);
    }
  });
}

// Verifique se o nome do arquivo é realmente withGreetingsModule.js (plural)
// Se for withGreetingModule.js (singular), ajuste o nome da função e o module.exports
const withGreetingsModule = (config) => {
  // Parte do withMainApplication permanece a mesma
  config = withMainApplication(config, async (modConfig) => {
    const { modResults } = modConfig;
    // Garante que temos o package name definido no app.json/app.config.js
    const packageName = config.android?.package;
    if (!packageName) {
      throw new Error("Android package name não está definido no app.json/app.config.js (expo.android.package)");
    }

    if (!modResults.contents.includes('new GreetingPackage()')) {
      // Use o package name correto na importação
      const importStatement = `import ${packageName}.greeting.GreetingPackage;`;
      const packageInstantiation = '      packages.add(new GreetingPackage());';

      // Verifica se a importação já existe (caso rode prebuild múltiplas vezes)
      if (!modResults.contents.includes(importStatement)) {
        modResults.contents = modResults.contents.replace(
          /(package\s+.*;)/,
          `$1\n${importStatement}`
        );
      }

      // Adiciona a instanciação (verificação primária já feita)
      modResults.contents = modResults.contents.replace(
        /(\s+return packages;)/,
        `\n${packageInstantiation}\n$1`
      );
    }
    return modConfig;
  });

  // Parte do withDangerousMod corrigida
  return withDangerousMod(config, [
    'android',
    async (modConfig) => {
      console.log("--- Executando withDangerousMod para Greeting ---");
      // console.log("Conteúdo de modConfig:", JSON.stringify(modConfig, null, 2)); // Pode remover ou comentar após confirmar

      // ----> CORREÇÃO PRINCIPAL AQUI <----
      // Acessa os caminhos dentro de modRequest
      const projectRoot = modConfig.modRequest.projectRoot;
      const platformProjectRoot = modConfig.modRequest.platformProjectRoot;

      console.log("Valor de projectRoot:", projectRoot); // Log corrigido
      console.log("Valor de platformProjectRoot:", platformProjectRoot); // Log corrigido

      // Verificação explícita para segurança usando os caminhos corretos
      if (!projectRoot) {
        throw new Error("[withGreetingsModule] modConfig.modRequest.projectRoot está undefined!");
      }
      if (!platformProjectRoot) {
        throw new Error("[withGreetingsModule] modConfig.modRequest.platformProjectRoot está undefined!");
      }

      // Usa platformProjectRoot corretamente obtido
      const androidSrcPath = path.join(platformProjectRoot, 'app/src/main/java');

      // Caminho onde o código Kotlin está no nosso projeto Expo
      // Usa projectRoot corretamente obtido
      const kotlinSourcePath = path.join(
        projectRoot, // Corrigido
        'native-modules/android-greetings/src/main/java' // Verifique se este subcaminho está correto!
      );

      // Caminho de destino dentro do projeto Android gerado
      const kotlinDestPath = androidSrcPath;

      // Verifique se a pasta de origem existe ANTES de copiar
      if (!fs.existsSync(kotlinSourcePath)) {
        console.error(`ERRO: Pasta de origem não encontrada: ${kotlinSourcePath}`);
        throw new Error(`[withGreetingsModule] Pasta de origem do módulo nativo não encontrada: ${kotlinSourcePath}`);
        // return modConfig; // Retornar aqui pode esconder o erro, melhor lançar.
      }

      console.log(`Copiando código Kotlin de ${kotlinSourcePath} para ${kotlinDestPath}...`);
      copyFolderRecursiveSync(kotlinSourcePath, kotlinDestPath);
      console.log('Código Kotlin copiado.');

      return modConfig;
    },
  ]);
};

// Verifique se o nome aqui corresponde ao nome do arquivo e da função
module.exports = withGreetingsModule;
