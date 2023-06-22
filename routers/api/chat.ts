import { Router } from "express";
import { getResponse, getResponseStream } from "../../utils/rag";
import { getSocket } from "../../utils/socket.io";
import { readStream } from "../../utils/stream";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { message, with_rag, stream } = req.body;
    if (stream) {
      const socketId = req.headers["x-socket-id"] as string;
      const socket = getSocket(socketId);
      if (!socket) {
        return res.status(400).json({ message: "Socket not found." });
      }
      const response = await getResponseStream(message, with_rag);

      if (!response.success || !response.completion) {
        return res.status(400).json({ message: "Something went wrong." });
      }

      const reader = response.completion.getReader();

      if (!reader) {
        return res.status(400).json({ message: "Something went wrong." });
      }

      readStream(reader, socket, "chat:datastream", 0);
      return res.send({
        success: true,
        data: {
          message: "Stream started.",
          rag_context: response.ragContext,
        },
      });
    }
    const response = await getResponse(message, with_rag);
    res.json({
      data: {
        response,
        rag_context: response.ragContext,
      },
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong." });
  }
});

export default router;
