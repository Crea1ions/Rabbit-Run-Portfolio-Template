#!/bin/bash
echo "=== VÉRIFICATION RAPIDE ==="
echo "1. components.css :"
grep -c "\.nav\s*{" css/components.css
echo "2. gallery.css ombres :"
grep "box-shadow.*0[[:space:]]*[48]" css/gallery.css
echo "3. gallery.js templates :"
head -n 60 js/gallery.js | tail -n 20 | grep -n "innerHTML"
echo "4. Images existent :"
if ls -A assets/images/oeuvres >/dev/null 2>&1; then
	echo "✓ au moins une image dans assets/images/oeuvres"
else
	echo "✗ aucun fichier trouvé dans assets/images/oeuvres"
fi

echo "=== GUARD DE PERFORMANCE ==="
if grep -q "\[PERF\]" js/core.js; then
	echo "✓ core.js log [PERF] présent"
else
	printf "✗ core.js manque le trace [PERF]\n"
fi
if grep -q "window.__GRF_PERF_STATUS" js/core.js; then
	echo "✓ core.js expose window.__GRF_PERF_STATUS"
else
	printf "✗ core.js n'expose pas window.__GRF_PERF_STATUS\n"
fi

echo "=== MODULES PERF ==="
for file in js/contact.js js/navigation.js; do
	echo "-> $file"
	grep -q "isPerfDegraded" "$file" && echo "   ✓ isPerfDegraded" || echo "   ✗ isPerfDegraded"
	grep -q "perfStatus\.subscribe" "$file" && echo "   ✓ perfStatus.subscribe" || echo "   ✗ perfStatus.subscribe"
done

echo "=== DOCUMENTATION QA & COMMS ==="
for doc in doc/qa-procedure.md doc/communication-plan.md; do
	if [ -f "$doc" ]; then
		echo "✓ $doc existe"
	else
		echo "✗ $doc manquant"
	fi
done
if grep -q "doc/qa-procedure.md" README.md; then
	echo "✓ README référence la procédure QA"
else
	echo "✗ README n'inclut pas doc/qa-procedure.md"
fi
if grep -q "doc/communication-plan.md" README.md; then
	echo "✓ README référence la communication"
else
	echo "✗ README n'inclut pas doc/communication-plan.md"
fi

echo "=== FIN VÉRIFICATION ==="
