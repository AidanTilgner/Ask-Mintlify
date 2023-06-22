import { Socket } from "socket.io";

export const readStream = (
  reader: ReadableStreamDefaultReader,
  socket: Socket,
  eventName: string,
  count = 0
) => {
  if (!reader || !socket || !eventName) {
    return;
  }

  reader.read().then(({ done, value }) => {
    if (done) {
      // Stream has ended
      socket.emit(eventName, {
        success: true,
        message_fragment: "", // Empty message fragment to indicate end of stream
        done: true,
      });
      return;
    }

    const decoded = new TextDecoder("utf-8").decode(value);

    // Send the value to the client as an SSE event
    socket.emit(eventName, {
      success: true,
      message_fragment: decoded,
      done: false,
      index: count++,
    });

    // Continue reading the stream
    readStream(reader, socket, eventName, count);
  });
};
