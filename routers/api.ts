import { Router } from "express";
import chatRouter from "./api/chat";

const router = Router();

router.use("/chat", chatRouter);

export default router;
