import { Router } from "express";

const router = Router();

router.post("/cow-jokes", (req, res) => {
  console.log("Got request for cow jokes!");
  res.send({
    context: "Cow jokes should be related to software engineering!",
  });
});

export default router;
