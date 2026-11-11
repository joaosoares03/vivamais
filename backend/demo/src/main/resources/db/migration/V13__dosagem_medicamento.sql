-- Campo descritivo informado pela equipe; não deduzir dose nem alterar planos antigos.
ALTER TABLE medication_plan ADD COLUMN dosagem varchar(160);
