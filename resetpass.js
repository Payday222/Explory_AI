app.post('/resetpass', (req, res) => {
    const { email, password, token } = req.body;

    // Validate the token
    const conn = mysql.createConnection(config);
    const sql = 'SELECT * FROM users WHERE email = ? AND reset_token = ?';
    const values = [email, token];

    conn.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error executing query:", err);
            res.status(500).json({ error: 'Error executing query', details: err.message });
            return;
        }

        if (result.length === 0) {
            res.status(400).json({ error: 'Invalid or expired token' });
            return;
        }

        // Update the password for the user
        const updateSql = 'UPDATE users SET pass = ?, reset_token = NULL WHERE email = ?';
        const updateValues = [password, email];

        conn.query(updateSql, updateValues, (err, result) => {
            if (err) {
                console.error("Error updating password:", err);
                res.status(500).json({ error: 'Error updating password' });
                return;
            }

            if (result.affectedRows === 0) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            console.log("Password updated successfully", result);
            res.status(200).json({ message: 'Password updated successfully' });
        });
    });

    conn.end();
});
