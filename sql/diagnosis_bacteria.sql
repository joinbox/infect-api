SELECT db.id_diagnosis, db.id_bacteria
FROM diagnosis_bacteria db
WHERE db.id_diagnosis IN ( %ids );