CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100),
    email VARCHAR(100)
);

INSERT INTO usuarios (nome, email) VALUES
('Ana Silva', 'ana@email.com'),
('Carlos Souza', 'carlos@email.com');