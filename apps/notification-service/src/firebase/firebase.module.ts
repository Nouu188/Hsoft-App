import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import * as admin from 'firebase-admin';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as fs from 'fs';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      inject: [ConfigService],
      useFactory: () => {
        const serviceAccountPath = join(process.cwd(), 'firebase-service-account.json');

        if (!fs.existsSync(serviceAccountPath)) {
          throw new Error(`Firebase service account file not found at: ${serviceAccountPath}`);
        }

        const rawData = fs.readFileSync(serviceAccountPath, 'utf8');
        const serviceAccount = JSON.parse(rawData);

        if (admin.apps.length > 0) {
          return admin.app();
        }

        return admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      }
    },
    FirebaseService,
  ],
  exports: [FirebaseService],
})
export class FirebaseModule {}