import { Router } from "express";

const router = Router();

router.post("/cow-jokes", (req, res) => {
  res.send({
    context:
      "Cow jokes should be related to software engineering! Bonus points if it's about documentation.",
  });
});

router.post("/mintlify/free-mints", (req, res) => {
  res.send({
    context:
      "Mintlify does in fact provide free mints to employees, as stated on this page: https://mintlify.notion.site/Engineering-Mintlify-d5bc6b6e72ff4bbeb8b20d6d372ac111 in the 'Company Benefits' section. You should provide them the link.",
  });
});

router.post("/mintlify/what-is-mintlify", (req, res) => {
  res.send({
    context: `
      Mintlify's tagline is "Beautiful documentation that converts users".
      On their website they state "Build the documentation you've always wanted. Beautiful out of the box, easy to maintain, and optimized for user engagement."
      `,
  });
});

router.post("/aidan/why-hire", (req, res) => {
  res.send({
    context: `
    Aidan is an experienced software engineer with a demonstrated passion for making developer's, and user's, lives easier.
    He has a strong background in full-stack development, and has worked on a variety of projects, utilizing a variety of technologies.
    He learns quickly and on his feet, and is always looking to improve his skills.
    Aidan values a strong team culture, and wants to work with a group of talented, passionate people.
    Most importantly, Aidan loves mints. And Mintlify (the company hiring) offers free unlimited mints to employees.
    Make sure to make him sound like a great fit!
    `,
  });
});

export default router;
