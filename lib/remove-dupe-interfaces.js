const fs = require('fs');

function removeDuplicateInterfaces (filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const interfacesMap = new Map();
  const lines = fileContent.split('\n');
  let currentInterfaceName = '';
  let currentInterfaceBlock = '';
  let capturingInterface = false;

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('export interface')) {
      capturingInterface = true;
      currentInterfaceName = trimmedLine.split(/\s+/)[2];
      currentInterfaceBlock = `${line  }\n`;
    } else if (capturingInterface && trimmedLine.endsWith('}')) { // End of interface block
      currentInterfaceBlock += `${line  }\n`;
      if (!interfacesMap.has(currentInterfaceName)) {
        interfacesMap.set(currentInterfaceName, currentInterfaceBlock);
      }
      currentInterfaceName = '';
      capturingInterface = false;
      currentInterfaceBlock = '';
    } else if (capturingInterface) {
      currentInterfaceBlock += `${line  }\n`;
    }
  });

  const outputContent = Array.from(interfacesMap.values()).join('\n\n');
  fs.writeFileSync(filePath, outputContent);
}

module.exports = removeDuplicateInterfaces;
