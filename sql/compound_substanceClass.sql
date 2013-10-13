SELECT cs.id_compound, ss.id_substanceClass
FROM compound_substance cs
JOIN substance_substanceclass ss ON ss.id_substance = cs.id_substance
WHERE cs.id_compound IN ( %ids );