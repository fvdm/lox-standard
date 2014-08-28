<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20140828144301 extends AbstractMigration
{
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != "mysql", "Migration can only be executed safely on 'mysql'.");
        
        $this->addSql("CREATE TABLE libbit_lox_settings (application_title VARCHAR(255) NOT NULL, application_logo VARCHAR(255) NOT NULL, app_backcolor VARCHAR(255) NOT NULL, app_fontcolor VARCHAR(255) NOT NULL, PRIMARY KEY(application_title)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB");
        $this->addSql("INSERT INTO libbit_lox_settings VALUES ('LocalBox', 'bundles/libbitlox/logo/whitebox.png', '#1B1B1B', '#999999')");
    }

    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != "mysql", "Migration can only be executed safely on 'mysql'.");
        
        $this->addSql("DROP TABLE libbit_lox_settings");
    }
}
