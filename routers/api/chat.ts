import { Router } from "express";
import { getResponse } from "../../utils/rag";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { message, with_rag } = req.body;
    const response = await getResponse(message, with_rag);
    res.json({
      data: {
        response,
      },
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong." });
  }
});

export default router;
