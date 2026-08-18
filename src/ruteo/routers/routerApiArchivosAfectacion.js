import express from "express";
import multer from "multer";
import controller from "../controllers/controllerArchivosAfectacion.js";

const router = express.Router();

const upload = multer({
    dest: "uploads/"
});

router.post(
    "/procesar",
    upload.single("archivo"),
    controller.procesarArchivo
);

export default router;