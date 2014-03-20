set :application, "lox-standard"
set :domain,      "office.rednose.nl"
set :deploy_to,   "/var/vhost/acceptance/#{application}.rednose.nl"
set :app_path,    "app"

set :repository,  "git@gitlab.rednose.nl:rednose/#{application}.git"
set :scm,         :git

role :web,        domain                         # Your HTTP server, Apache/etc
role :app,        domain, :primary => true       # This may be the same as your `Web` server

set :use_sudo,      false
set :keep_releases,  3

set :shared_files,      ["app/config/parameters.yml"]
set :shared_children,   [app_path + "/logs", "data"]

set :use_composer,          true
set :update_vendors,        true
set :dump_assetic_assets,   true
set :interactive_mode,      false

set :git_enable_submodules, true 
set :deploy_via,            :remote_cache

set :user,                (`whoami`).chomp
set :writable_dirs,       ["app/cache", "app/logs", "data"]
set :webserver_user,      "www-data"
set :permission_method,   :acl
set :use_set_permissions, true

default_run_options[:pty] = true

logger.level = Logger::MAX_LEVEL
