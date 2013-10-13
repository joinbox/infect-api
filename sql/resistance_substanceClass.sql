SELECT 
	  bs.id_bacteria
	, cs.id_compound
	, bs.resistanceDefault
	, bs.resistanceUser
	, bs.resistanceImport
FROM bacteria_substanceClass bs
JOIN (
	SELECT 
		  node.id originId
		, parent.id substanceClassId
	FROM 
		  substanceClass AS node
		, substanceClass AS parent
	WHERE 
		parent.lft BETWEEN node.lft AND node.rgt 
	ORDER BY node.lft
) classTree ON classTree.originId = bs.id_substanceClass
JOIN substance_substanceclass ss ON ss.id_substanceClass = classTree.substanceClassId 
JOIN compound_substance cs ON cs.id_substance = ss.id_substance
GROUP BY bs.id_bacteria, cs.id_compound
ORDER BY bs.id_bacteria, cs.id_compound