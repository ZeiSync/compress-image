const fs = require('fs');
const sharp = require('sharp');
const path = require('path');



const resizeImageBuffer = (Imgpath, image, toFolder) => {
  return new Promise((res, rej) => {
    sharp(Imgpath, { failOnError: false })
      .resize({
        width: 960,
      })
      .withMetadata()
      .jpeg({ progressive: true, force: false, quality: 96 })
      .png({ progressive: true, force: false, quality: 80 })
      .toFile(
        path.resolve(toFolder, image))
      .then(data => {
        res(`${toFolder}${image}`)
      })
      .catch(error => {
        rej(error)
      })
  })
}

const compress = (fromFolder, toFolder) => {
  if (!fs.existsSync(fromFolder)) {
    fs.mkdirSync(fromFolder);
  }

  if (!fs.existsSync(toFolder)) {
    fs.mkdirSync(toFolder);
  }

  const paths = fs.readdirSync(fromFolder);

  console.log(`
    ================================================
    Starting compress files from ${fromFolder} => ${toFolder}
    Total files: ${paths.length}
    ================================================
  `);

  const promises = paths.map((p) => {
    if (fs.existsSync(`${toFolder}${p}`)) {
      return;
    }

    if (!p.match(/.*\.(jpe?g|bmp|png)$/igm)) {
      if (!p.includes(".")) return;
      return fs.copyFileSync(`${fromFolder}${p}`, `${toFolder}${p}`)
    };

    if (fs.statSync(`${fromFolder}${p}`).size < 400000) {
      return fs.copyFileSync(`${fromFolder}${p}`, `${toFolder}${p}`)
    };


    return resizeImageBuffer(`${fromFolder}${p}`, p, toFolder).then(result => console.log(result)).catch((e) => {
      console.log("file name: " + p + " can't compress");
      console.log("with error: " + e);
      fs.copyFileSync(`${fromFolder}${p}`, `${toFolder}${p}`)
    });

  });

  return Promise.all(promises).then((result) => {
    console.log(`
    ================================================
    Compress done!!!  ${fromFolder} => ${toFolder}
    Total files compressed: ${result.length}
    ================================================
  `);
  });
}

const main = () => {
  const TARGET_DIR = '/root/media/';
  const COMPRESSED_PATH = '/root/media/';

  // check target directory
  if (!fs.existsSync(TARGET_DIR)) {
    console.log(`
    ================================================
    ${TARGET_DIR} Not Found!
    ================================================
    `);
    return;
  }

  // create folder compress name
  const folderCompress = new Date().toISOString().substring(0, 10).replaceAll('-', '') + '_uploads';
  console.log(`
    ================================================
    Init folder with paths: 
    - ${COMPRESSED_PATH}${folderCompress}/
    ================================================
  `);
  if (fs.existsSync(`${COMPRESSED_PATH}${folderCompress}/`)) {
    console.log(`
    ================================================
    Folder ${COMPRESSED_PATH}${folderCompress}/ already exists
    Re-create directory
    ================================================
    `);
    fs.rmSync(`${COMPRESSED_PATH}${folderCompress}/`, { recursive: true });
  }
  fs.mkdirSync(`${COMPRESSED_PATH}${folderCompress}/`);

  // Get all directory and child directory
  // const allDirInUpload = fs.readdirSync(TARGET_DIR).reduce((result, dir) => {
  //   if(!fs.statSync(`${TARGET_DIR}${dir}`).isDirectory()) return result;
  //   const newDirectory = {
  //     from: `${TARGET_DIR}${dir}/`,
  //     to: `${COMPRESSED_PATH}${folderCompress}/${dir}/`  
  //   }; 

  //   result.push(newDirectory);

  //   const isHaveChildDir = fs.readdirSync(`${TARGET_DIR}${dir}`).filter(childDir => fs.statSync(`${TARGET_DIR}${dir}/${childDir}`).isDirectory());

  //   isHaveChildDir.forEach(childDir => {
  //     newDirectory.from + `${childDir}/`;
  //     newDirectory.to += `${childDir}/`;
  //     result.push({
  //       from: `${TARGET_DIR}${dir}/${childDir}/`,
  //       to: `${COMPRESSED_PATH}${folderCompress}/${dir}`  
  //     }); 
  //   })

  //   return result;
  // }, []);


  const imageFolders = [
    // {
    //   from: `${TARGET_DIR}`,
    //   to: `${COMPRESSED_PATH}${folderCompress}/`
    // },
    {
      from: `${TARGET_DIR}images/`,
      to: `${COMPRESSED_PATH}${folderCompress}/images/`
    },
    // Community
    {
      from: `${TARGET_DIR}images/thumbnail/`,
      to: `${COMPRESSED_PATH}${folderCompress}/images/thumbnail/`
    }
    // E-commers
    // {
    //   from: `${TARGET_DIR}images/ID/`,
    //   to: `${COMPRESSED_PATH}${folderCompress}/images/ID/`
    // },
    // {
    //   from: `${TARGET_DIR}images/categories/`,
    //   to: `${COMPRESSED_PATH}${folderCompress}/images/categories/`
    // },
    // {
    //   from: `${TARGET_DIR}images/products/`,
    //   to: `${COMPRESSED_PATH}${folderCompress}/images/products/`
    // }
  ];

  for (const dir of imageFolders) {
    compress(dir.from, dir.to);
  }
};

main();