SELECT 
	  d.*
	, dl.*
FROM drug d
JOIN drugLocale dl ON dl.id_drug = d.id
WHERE d.id_compound IN ( %ids )
ORDER BY id_compound, id_country, id_language;