import pool from "./database";

const createTables = async () => {
  const createWalletsTable = `
    CREATE TABLE IF NOT EXISTS Wallets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL UNIQUE,
      balance INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;

  const createTransactionsTable = `
    CREATE TABLE IF NOT EXISTS Transactions (
      id VARCHAR(255) PRIMARY KEY,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      description TEXT,
      type ENUM('deposit', 'withdrawal') NOT NULL,
      type_method VARCHAR(50),
      state ENUM('successful', 'pending', 'failed') NOT NULL,
      user_id VARCHAR(255) NOT NULL,
      user_name VARCHAR(255),
      amount INT NOT NULL,
      currency VARCHAR(3) NOT NULL DEFAULT 'AUD',
      debit_credit ENUM('debit', 'credit') NOT NULL,
      FOREIGN KEY (user_id) REFERENCES Wallets(user_id)
    );
  `;

  try {
    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Create the tables
    await connection.query(createWalletsTable);
    console.log("Wallets table created or already exists.");

    await connection.query(createTransactionsTable);
    console.log("Transactions table created or already exists.");

    // Release the connection
    connection.release();
  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    process.exit(); // Exit the process once tables are created
  }
};

// Run the function to create tables
createTables();
