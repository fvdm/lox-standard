<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20140512142339 extends AbstractMigration
{
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != "mysql", "Migration can only be executed safely on 'mysql'.");
        
        $this->addSql("CREATE TABLE libbit_lox_key_item (id INT AUTO_INCREMENT NOT NULL, user_id INT DEFAULT NULL, owner_id INT DEFAULT NULL, item_id INT DEFAULT NULL, `key` VARCHAR(255) NOT NULL, iv VARCHAR(255) NOT NULL, INDEX IDX_E4F75930A76ED395 (user_id), INDEX IDX_E4F759307E3C61F9 (owner_id), INDEX IDX_E4F75930126F525E (item_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB");
        $this->addSql("CREATE TABLE libbit_lox_key_pair (id INT AUTO_INCREMENT NOT NULL, user_id INT DEFAULT NULL, public_key LONGTEXT DEFAULT NULL, private_key LONGTEXT DEFAULT NULL, INDEX IDX_F2B66247A76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB");
        $this->addSql("CREATE TABLE libbit_lox_user_preferences (id INT AUTO_INCREMENT NOT NULL, user_id INT DEFAULT NULL, email TINYINT(1) NOT NULL, INDEX IDX_36F261C7A76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB");
        $this->addSql("ALTER TABLE libbit_lox_key_item ADD CONSTRAINT FK_E4F75930A76ED395 FOREIGN KEY (user_id) REFERENCES rednose_framework_user (id) ON DELETE CASCADE");
        $this->addSql("ALTER TABLE libbit_lox_key_item ADD CONSTRAINT FK_E4F759307E3C61F9 FOREIGN KEY (owner_id) REFERENCES rednose_framework_user (id) ON DELETE CASCADE");
        $this->addSql("ALTER TABLE libbit_lox_key_item ADD CONSTRAINT FK_E4F75930126F525E FOREIGN KEY (item_id) REFERENCES libbit_lox_item (id) ON DELETE CASCADE");
        $this->addSql("ALTER TABLE libbit_lox_key_pair ADD CONSTRAINT FK_F2B66247A76ED395 FOREIGN KEY (user_id) REFERENCES rednose_framework_user (id) ON DELETE CASCADE");
        $this->addSql("ALTER TABLE libbit_lox_user_preferences ADD CONSTRAINT FK_36F261C7A76ED395 FOREIGN KEY (user_id) REFERENCES rednose_framework_user (id) ON DELETE CASCADE");
        $this->addSql("DROP TABLE notification__message");
        $this->addSql("CREATE UNIQUE INDEX UNIQ_2EE04D5A5F37A13B ON rednose_framework_access_token (token)");
        $this->addSql("CREATE UNIQUE INDEX UNIQ_CA19EB655F37A13B ON rednose_framework_auth_code (token)");
        $this->addSql("CREATE UNIQUE INDEX UNIQ_F0032855F37A13B ON rednose_framework_refresh_token (token)");
        $this->addSql("ALTER TABLE rednose_framework_user ADD locale VARCHAR(255) DEFAULT NULL");
        $this->addSql("ALTER TABLE libbit_lox_link DROP INDEX IDX_91E51950126F525E, ADD UNIQUE INDEX UNIQ_91E51950126F525E (item_id)");
        $this->addSql("ALTER TABLE libbit_lox_link ADD expires DATETIME DEFAULT NULL");
    }

    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != "mysql", "Migration can only be executed safely on 'mysql'.");
        
        $this->addSql("CREATE TABLE notification__message (id INT AUTO_INCREMENT NOT NULL, type VARCHAR(255) NOT NULL, body LONGTEXT NOT NULL COMMENT '(DC2Type:json)', state INT NOT NULL, restart_count INT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, started_at DATETIME DEFAULT NULL, completed_at DATETIME DEFAULT NULL, INDEX state (state), INDEX createdAt (created_at), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB");
        $this->addSql("DROP TABLE libbit_lox_key_item");
        $this->addSql("DROP TABLE libbit_lox_key_pair");
        $this->addSql("DROP TABLE libbit_lox_user_preferences");
        $this->addSql("ALTER TABLE libbit_lox_link DROP INDEX UNIQ_91E51950126F525E, ADD INDEX IDX_91E51950126F525E (item_id)");
        $this->addSql("ALTER TABLE libbit_lox_link DROP expires");
        $this->addSql("DROP INDEX UNIQ_2EE04D5A5F37A13B ON rednose_framework_access_token");
        $this->addSql("DROP INDEX UNIQ_CA19EB655F37A13B ON rednose_framework_auth_code");
        $this->addSql("DROP INDEX UNIQ_F0032855F37A13B ON rednose_framework_refresh_token");
        $this->addSql("ALTER TABLE rednose_framework_user DROP locale");
    }
}
