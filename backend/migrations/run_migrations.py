import os
import importlib.util

def run_migrations():
    migrations_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Get all .py files in migrations directory
    migration_files = [f for f in os.listdir(migrations_dir) 
                      if f.endswith('.py') and f != '__init__.py' 
                      and f != 'run_migrations.py']
    
    for migration_file in sorted(migration_files):
        print(f"Running migration: {migration_file}")
        
        # Import and run migration
        spec = importlib.util.spec_from_file_location(
            migration_file[:-3],
            os.path.join(migrations_dir, migration_file)
        )
        migration = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(migration)
        
        try:
            migration.upgrade()
            print(f"Successfully completed migration: {migration_file}")
        except Exception as e:
            print(f"Error running migration {migration_file}: {str(e)}")
            raise

if __name__ == "__main__":
    run_migrations() 