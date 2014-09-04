<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20140331134636 extends AbstractMigration
{
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != "mysql", "Migration can only be executed safely on 'mysql'.");
        
        $this->addSql("RENAME TABLE rednose_lox_notification TO libbit_lox_notification");
        $this->addSql("RENAME TABLE rednose_lox_invitation TO libbit_lox_invitation");
        $this->addSql("RENAME TABLE rednose_lox_item TO libbit_lox_item");
        $this->addSql("RENAME TABLE rednose_lox_link TO libbit_lox_link");
        $this->addSql("RENAME TABLE rednose_lox_revision TO libbit_lox_revision");
        $this->addSql("RENAME TABLE rednose_lox_share TO libbit_lox_share");
        $this->addSql("RENAME TABLE rednose_lox_shares_groups TO libbit_lox_shares_groups");
        $this->addSql("RENAME TABLE rednose_lox_shares_users TO libbit_lox_shares_users");

        $this->addSql("UPDATE `libbit_lox_notification` SET `type` = REPLACE (`type`, \"Rednose\", \"Libbit\")");
    }

    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != "mysql", "Migration can only be executed safely on 'mysql'.");

        $this->addSql("RENAME TABLE libbit_lox_notification TO rednose_lox_notification");
        $this->addSql("RENAME TABLE libbit_lox_invitation TO rednose_lox_invitation");
        $this->addSql("RENAME TABLE libbit_lox_item TO rednose_lox_item");
        $this->addSql("RENAME TABLE libbit_lox_link TO rednose_lox_link");
        $this->addSql("RENAME TABLE libbit_lox_revision TO rednose_lox_revision");
        $this->addSql("RENAME TABLE libbit_lox_share TO rednose_lox_share");
        $this->addSql("RENAME TABLE libbit_lox_shares_groups TO rednose_lox_shares_groups");
        $this->addSql("RENAME TABLE libbit_lox_shares_users TO rednose_lox_shares_users");

        $this->addSql("UPDATE `rednose_lox_notification` SET `type` = REPLACE (`type`, \"Libbit\", \"Rednose\")");
    }
}
