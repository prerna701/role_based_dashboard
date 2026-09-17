import { Injectable } from '@nestjs/common';

type MailPayload = {
  to: string;
  data?: Record<string, unknown>;
};

@Injectable()
export class MailService {
  async userSignUp(_payload: MailPayload): Promise<void> {}

  async forgotPassword(_payload: MailPayload): Promise<void> {}

  async confirmNewEmail(_payload: MailPayload): Promise<void> {}
}
