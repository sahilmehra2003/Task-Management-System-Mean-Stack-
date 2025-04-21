import { Injectable } from '@angular/core';

@Injectable()
export class MaskEmailService {
  maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    const maskedLocal = local.length > 2
      ? local[0] + '*'.repeat(local.length - 2) + local.slice(-1)
      : local[0] + '*';
    const maskedDomain = domain.length > 4
      ? domain.slice(0, -4) + '***'
      : '****';
    return `${maskedLocal}@${maskedDomain}`;
  }
}
