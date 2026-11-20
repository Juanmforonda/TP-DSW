import { Migration } from '@mikro-orm/migrations';

export class Migration20261120190145AddPagoAuditoria extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`pago_auditoria\` (\`id\` int unsigned not null auto_increment primary key, \`fecha\` datetime not null, \`estado_anterior\` tinyint(1) not null, \`estado_nuevo\` tinyint(1) not null, \`importe\` numeric(10,2) not null, \`moneda\` varchar(255) not null, \`fuente\` enum('manual', 'mercado_pago') not null, \`payment_id\` varchar(255) null, \`motivo\` text null, \`cuota_id\` int unsigned not null, \`administrador_id\` int unsigned null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`pago_auditoria\` add index \`pago_auditoria_cuota_id_index\`(\`cuota_id\`);`);
    this.addSql(`alter table \`pago_auditoria\` add index \`pago_auditoria_administrador_id_index\`(\`administrador_id\`);`);

    this.addSql(`alter table \`pago_auditoria\` add constraint \`pago_auditoria_cuota_id_foreign\` foreign key (\`cuota_id\`) references \`cuota_mensual\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`pago_auditoria\` add constraint \`pago_auditoria_administrador_id_foreign\` foreign key (\`administrador_id\`) references \`administrador\` (\`id\`) on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists \`pago_auditoria\`;`);
  }

}
