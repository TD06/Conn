import {Router} from "express";
import { checkUser, getAllUsers, onBoardUser, generateToken } from "../controllers/AuthController.js";
import { generateToken04 } from "../utils/TokenGenerator.js";


const router = Router()
router.post("/chech-user" , checkUser);
router.post("/onboard-user", onBoardUser);
router.get("/get-contacts", getAllUsers);
router.get("/generate-token/:userId" , generateToken)
export default router;

