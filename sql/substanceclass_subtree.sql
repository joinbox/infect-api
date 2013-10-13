SELECT 
	  id
	, name
	, depth
	, treeId
	, id_language 
FROM ( 
	SELECT 
		  node.id treeId
		, parent.id
		, ( SELECT count( innerParent.id ) -1 as depth
	     	FROM substanceClass AS innerNode, substanceClass AS innerParent
	     	WHERE innerNode.lft BETWEEN innerParent.lft AND innerParent.rgt AND innerNode.id = parent.id ) depth
	FROM 
		  substanceClass AS node
		, substanceClass AS parent
	WHERE 
		node.lft BETWEEN parent.lft AND parent.rgt 
	ORDER BY node.lft
) list
JOIN substanceClassLocale scl ON list.id = scl.id_substanceClass
ORDER BY treeId, depth ASC, id_language
