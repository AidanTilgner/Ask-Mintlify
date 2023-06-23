## Ask Mintlify Demo

This is a demo of a potential way to optimize the context injection system of the [Mintlify](https://mintlify.com/docs) "Ask Mintlify" feature.

### The Problem

There is a problem that plagues integrations of LLMs that utilize context injection, which is context length. There is 1) only so much information that a chatbot can pay "attention" to, and 2) a real monetary cost to processing each individual token, (albeit usually a relatively cheap one).

#### Assumptions

I'll be making a few assumptions as to the mechanics of the current "Ask Mintlify" chatbot approach. These assumptions are based on my experience with the Mintlify platform, and integrating LLMs into applications, and may not be 100% accurate.

- Assumption 1: The chatbot is using a transformer-based LLM, such as gpt-3.5-turbo or Claude, with a black box API
- Assumption 2: The way that the chatbot is fine-tuned, is via feeding it additional context before it sends a response
- Assumption 3: This context feeding method uses unnecessary tokens by providing context that is not relevant

#### Example

I want a "ChatGPT for my website", so before I prompt ChatGPT directly, I feed it a giant block of text explaining everything I need to know about the website:

**User Input**:

> What is Aidan's contact information?

**Actual Prompt**:

> The User Said: "What is Aidan's contact information?". Here is some additional context to help you answer: "Aidan Tilgner is a software engineer with years of experience in the field. His skills include Typescript, React, REST API development, and other full-stack development tools. He learns fast and on his feet, cares about maintaining quality while keeping a fast-pace, and cares deeply about the end-user. Aidan has worked with large-scale applications, on both the frontend and backend, and is involved in many developer communities. This allows him to keep up to date on the latest technological advancements that may impact his work or future projects. Aidan's email is aidantilgner02@gmail.com, and his phone number is (503)-200-7472. His website is https://www.aidantilgner.dev."

**LLM Response**:

> Aidan's email is aidantilgner02@gmail.com, and his phone number is (503)-200-7472.

As you can see, there is a problem with context added not being relevant to the question that was asked. While this context may be useful in certain situations, providing it when the LLM does not utilize the information can be inefficient in terms of token usage and cost.

### The Solution

So, what is the solution? I propose utilizing a Retrieval Augmented Generation approach. However, not the currently popular method which utilizes a vector DB. Instead, a custom, low-resource language classification model will be used to determine the intent of the user input, and provide additional context to the LLM based on that intent.

#### Example

Using the same example as above, where the goal is to have a "ChatGPT for your Website", the following would be the process:

**User Input**:

> What is Aidan's contact information?

**Intent Classification**:

> Intent: "Contact Information"

**Actual Prompt**:

> The User Said: "What is Aidan's contact information?". Here is some additional context to help you answer: "Aidan's email is aidantilgner02@gmail.com, and his phone number is (503)-200-7472. His website is https://www.aidantilgner.dev."

**LLM Response**:

> Aidan's email is aidantilgner02@gmail.com, and his phone number is (503)-200-7472. His website is https://www.aidantilgner.dev.

As you can see, the context provided is much more relevant to the question that was asked, and therefore the LLM is more likely to use it, and less likely to waste tokens.

### The Demo

Go to [this site](https://ask-mintlify-demo.aidantilgner.dev/), and type into the text box a question or other prompt. Then, depending on whether the "With Retrieval Augmented Generation" checkbox is checked, you will see the response from the LLM with or without the additional context.

Some pre-made prompts to try with and without the checkbox applied:

- "Tell me a cow joke"
- "Does Mintlify provide their employees with unlimited free mints?"
- "What is Mintlify?"
- "Why should I hire Aidan?"

### The Code

TBH, I don't super feel like writing out a detailed explanation of the code, maybe I should write some documentation ;). However, I'll provide a brief overview of how the system works, provided you also don't feel like diving into it yourself.

> **Note**: Please don't judge my code too hard I made it in a hurry :O

#### The Frontend

The frontend is a pretty simple React app.

#### The Backend

An express API that uses [nlp.js](https://github.com/axa-group/nlp.js) to classify the intent of the user input. The `data/corpus.json` file provides training data for each intent, as well as an endpoint to call if that intent is classified, in order to recieve context. The `routers/rag/index.ts` file defines the different endpoints, and what context should be sent back for one. In a future implementation, this would be a more complex retrieval system, possibly allowing for variables such as extracted entities to be sent in the form body.

If an intent is classified with a reasonable confidence, then the context is retrieved from the endpoint, and the context is injected into the "user" prompt. The prompt is then sent to the LLM, and the response is returned to the frontend via socket.io, in order to display the real-time stream sent back from OpenAI.
