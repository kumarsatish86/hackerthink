// Migration wrapper that prevents database operations during build time
export class MigrationWrapper {
  private static instance: MigrationWrapper;
  private migrationsLoaded = false;
  private migrations: any = null;

  private constructor() {}

  public static getInstance(): MigrationWrapper {
    if (!MigrationWrapper.instance) {
      MigrationWrapper.instance = new MigrationWrapper();
    }
    return MigrationWrapper.instance;
  }

  public async loadMigrations() {
    // Only load migrations when explicitly called, not during build
    if (!this.migrationsLoaded) {
      try {
        // Dynamic import to prevent build-time execution
        const { default: runMigrations } = await import('./run-migrations');
        this.migrations = runMigrations;
        this.migrationsLoaded = true;
        console.log('Migrations loaded successfully');
      } catch (error) {
        console.error('Failed to load migrations:', error);
        throw error;
      }
    }
    return this.migrations;
  }

  public async runMigrations() {
    if (!this.migrations) {
      await this.loadMigrations();
    }
    
    if (this.migrations) {
      return await this.migrations();
    }
    
    throw new Error('Migrations not loaded');
  }

  public isMigrationsLoaded(): boolean {
    return this.migrationsLoaded;
  }
}

// Export singleton instance
export const migrationWrapper = MigrationWrapper.getInstance();

