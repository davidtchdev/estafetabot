import fs from 'fs';

function deleteFilesInFolderExcept(folderPath: string, exceptFiles: string[]): void {
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }

    files.forEach((file) => {
      const filePath = `${folderPath}/${file}`;
      if (!exceptFiles.includes(file)) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Error deleting file:", filePath, err);
          } else {
            console.log("Deleted file:", filePath);
          }
        });
      }
    });
  });
}

export default deleteFilesInFolderExcept;