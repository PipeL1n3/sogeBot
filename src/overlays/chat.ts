import { v4 } from 'uuid';

import Overlay from './_interface';

import { timer } from '~/decorators';
import { onMessage } from '~/decorators/on';
import { ioServer } from '~/helpers/panel';
import { parseTextWithEmotes } from '~/helpers/parseTextWithEmotes';
import { adminEndpoint } from '~/helpers/socket';

class Chat extends Overlay {
  showInUI = false;

  @timer()
  async withEmotes (text: string | undefined) {
    return parseTextWithEmotes(text, 3);
  }

  @onMessage()
  message(message: onEventMessage) {
    this.withEmotes(message.message).then(data => {
      ioServer?.of('/overlays/chat').emit('message', {
        id:        v4(),
        timestamp: message.timestamp,
        username:  message.sender.displayName.toLowerCase() === message.sender.userName ? message.sender.displayName : `${message.sender.displayName} (${message.sender.userName})`,
        message:   data,
        show:      false,
      });
    });
  }

  sockets() {
    adminEndpoint('/overlays/chat', 'test', (data) => {
      this.withEmotes(data.message).then(message => {
        ioServer?.of('/overlays/chat').emit('message', {
          id:        v4(),
          timestamp: Date.now(),
          username:  data.username,
          message,
          show:      false,
        });
      });
    });
  }
}

export default new Chat();