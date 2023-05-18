import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { ClientMessage } from './dtos/client-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interface';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;

    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token);
      await this.messagesWsService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect();
      return;
    }

    this.wss.emit('client-update', this.messagesWsService.getClientsConected());
  }

  handleDisconnect(client: Socket) {
    //console.log('Cliente Desconectado', client.id);
    this.messagesWsService.removeClient(client.id);
    this.wss.emit('client-update', this.messagesWsService.getClientsConected());
  }

  @SubscribeMessage('client-message')
  handleOnClientMessage(client: Socket, paload: ClientMessage) {
    //! Emite el mensaje unicamente al mismo usuario que lo envio
    // client.emit('server-message', {
    //   fullName: 'Soy Yo',
    //   message: paload.message,
    // });

    //! Emite a todos los clientes conectados excepto al que envio el mensaje
    // client.broadcast.emit('server-message', {
    //   fullName: 'Soy Yo',
    //   message: paload.message,
    // });

    //! Emite a todos los clientes incluido el que envio el mensaje
    this.wss.emit('server-message', {
      fullName: this.messagesWsService.getFullNameUse(client),
      message: paload.message,
    });
  }
}
