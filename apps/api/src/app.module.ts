import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { appConfig, databaseConfig, jwtConfig } from './config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { MembersModule } from './modules/members/members.module';
import { CigsModule } from './modules/cigs/cigs.module';
import { LivestockModule } from './modules/livestock/livestock.module';
import { WaterVouchersModule } from './modules/water-vouchers/water-vouchers.module';
import { FinanceModule } from './modules/finance/finance.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { PurchasesModule } from './modules/purchases/purchases.module';
import { ProcurementModule } from './modules/procurement/procurement.module';
import { StaffModule } from './modules/staff/staff.module';
import { CommoditiesModule } from './modules/commodities/commodities.module';
import { NgosModule } from './modules/ngos/ngos.module';
import { GrantsModule } from './modules/grants/grants.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { WebsiteModule } from './modules/website/website.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AuditModule } from './modules/audit/audit.module';
import { HealthModule } from './modules/health/health.module';
import { UploadModule } from './modules/upload/upload.module';
import { FeedlotModule } from './modules/feedlot/feedlot.module';
import { CommunicationsModule } from './modules/communications/communications.module';
import { DocumentsModule } from './modules/documents/documents.module';
// SettingsModule imported here; implementation added in FEAT-002
import { SettingsModule } from './modules/settings/settings.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        database: config.get<string>('database.name'),
        username: config.get<string>('database.username'),
        password: config.get<string>('database.password'),
        autoLoadEntities: true,
        synchronize: config.get<boolean>('database.synchronize'),
        logging: config.get<boolean>('database.logging'),
      }),
    }),

    // Rate limiting: 100 requests per minute globally
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    // Feature modules
    AuthModule,
    UsersModule,
    RolesModule,
    MembersModule,
    CigsModule,
    LivestockModule,
    FeedlotModule,
    WaterVouchersModule,
    FinanceModule,
    SuppliersModule,
    PurchasesModule,
    ProcurementModule,
    StaffModule,
    DocumentsModule,
    CommoditiesModule,
    NgosModule,
    GrantsModule,
    ProjectsModule,
    WebsiteModule,
    DashboardModule,
    AuditModule,
    CommunicationsModule,
    HealthModule,
    UploadModule,
    SettingsModule,
  ],
})
export class AppModule {}
