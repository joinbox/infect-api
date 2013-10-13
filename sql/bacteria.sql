SELECT 
	  b.*
	, sp.name species
	, ge.name genus 
FROM bacteria b
JOIN species sp ON sp.id = b.id_species
JOIN genus ge ON sp.id_genus = ge.id;