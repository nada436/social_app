
import fs from 'fs';
import multer from 'multer';
import { nanoid } from 'nanoid';

export const fileTypes = {
  image: ["image/png", "image/jpeg", "image/gif"],
  video: ["video/mp4"],
  audio: ["audio/mpeg"],
  pdf: ["application/pdf"]
};

export const multerLocal = (customValidation = [], customPath = 'general') => {
  const fullPath = `uploads/${customPath}`;
  
  // Check if the directory exists, and create it if it doesn't
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }

  
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      
      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      `${nanoid(4)}.${file.originalname.split('.').pop()}`;
      
      cb(null, `${nanoid(4)}+file.originalname`);
    },
  });
  

  function fileFilter(req, file, cb) {
    if (customValidation.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format'), false);
    }
  }

  const upload = multer({ storage, fileFilter });
  return upload;
};



export const multerHOST = (customValidation = []) => {
  const storage = multer.diskStorage({})
  function fileFilter(req, file, cb) {
    if (customValidation.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format'), false);
    }
  }

  const upload = multer({ storage, fileFilter });
  return upload;
};
