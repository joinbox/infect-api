SELECT 
	  s.id
	, sl.name
	, cs.id_compound
	, sl.id_language
FROM substance s
JOIN compound_substance cs ON cs.id_substance = s.id 
JOIN substanceLocale sl ON sl.id_substance = s.id
WHERE cs.id_compound IN ( %ids )
ORDER BY id_compound, id_language;