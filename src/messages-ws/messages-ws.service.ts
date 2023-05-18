import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { User } from '../auth/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

interface ConnectClients {
  [id: string]: {
    socket: Socket;
    user: User;
  };
}

@Injectable()
export class MessagesWsService {
  private connectClients: ConnectClients = {};

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async registerClient(client: Socket, id: string) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new Error('User not found! ');
    if (!user.isActive) throw new Error('User not valid!');

    this.checkConnectionClientUser(user);

    this.connectClients[client.id] = { socket: client, user: user };
  }

  removeClient(clientId: string) {
    delete this.connectClients[clientId];
  }

  getClientsConected(): string[] {
    return Object.keys(this.connectClients);
  }

  getFullNameUse(client: Socket) {
    return this.connectClients[client.id].user.fullName;
  }

  checkConnectionClientUser(user: User) {
    for (const clientId of Object.keys(this.connectClients)) {
      const connectClients = this.connectClients[clientId];

      if (connectClients.user.id === user.id) {
        connectClients.socket.disconnect();
        break;
      }
    }
  }
}
