# Script de démo — EVOLUTION.SYS

Durée cible : **5-7 minutes**. Objectif : montrer que le concept (TD +
univers dev cyberpunk) fonctionne, est jouable, et que l'IA apporte une
vraie valeur — pas juste un gadget.

Captures d'écran sources dans [`docs/screenshots/`](./docs/screenshots).

## 1. Accroche (30s)

> "Un serveur de production tombe toujours au pire moment. Ici, c'est
> littéralement le jeu : vous êtes l'admin sys qui défend son serveur
> contre des vagues de bugs — syntax errors, memory leaks, jusqu'au boss
> final, l'incident de prod totale."

Montrer le titre (`EVOLUTION.SYS`) sur l'écran d'accueil CRT.

## 2. Le cœur de jeu (2 min, live)

1. Inscription rapide (compte de démo déjà prêt en filet de sécurité, cf.
   plan B ci-dessous).
2. Lancer **Story Mode → niveau 1**.
3. Placer 2-3 tours différentes (STDOUT, IDE_ENV) en expliquant la
   métaphore : chaque tour = un outil de dev réel (linter, IDE, CI/CD, IA).
4. Améliorer une tour (fusion) → montrer la montée en puissance.
5. Laisser passer une vague, montrer la perte d'INTEGRITY, puis stabiliser.

**Message clé** : le gameplay TD est complet (placement, amélioration,
vente, déplacement, vagues, victoire/défaite) — pas un prototype.

## 3. L'IA (1min30, moment fort de la démo)

1. Montrer un tip du **AI Tactical Advisor** apparaître dans les logs
   système en bas d'écran pendant la partie.
2. Expliquer : le serveur envoie l'état de la partie (tours, ressources,
   vagues à venir) à un LLM avec un system prompt dédié, qui répond en
   quelques mots, façon "senior dev qui regarde par-dessus l'épaule".
3. (Si prévu/implémenté) Montrer un boss avec son lore généré.

**Filet IA** : si l'appel LLM est lent/échoue en live, le jeu reste
jouable — fallback heuristique local automatique (`server/socket/tacticalAdvisor.js`),
donc pas de blocage à montrer, juste un conseil "moins inspiré".

## 4. Progression & rejouabilité (1 min)

- Fin de partie → écran de victoire/défaite → crédits gagnés.
- Écran **Hardware Mods** : dépenser les crédits en amélioration
  permanentes (dégâts, fusion max).
- Écran **Hall of Fame** (classement) et **System Logs** (bestiaire
  débloqué progressivement) : boucle méta pour donner envie de rejouer.

## 5. Ce qu'il reste à faire (30s, honnêteté > perfection)

- État des lieux transparent : voir `cadrage.md` (MoSCoW) et les issues
  ouvertes du repo.
- Ne pas cacher les limites connues (cf. `TESTING.md` section "dette de
  test") — montre une équipe qui maîtrise son sujet plutôt qu'un produit
  qui prétend être fini.

---

## Plan de secours (démo fragile → gestion d'aléas)

| Risque | Parade |
|---|---|
| Pas de réseau / API IA (Groq) injoignable | Le jeu reste jouable en fallback heuristique local — ne rien dire de spécial, ça se voit à peine. Le mentionner seulement si demandé. |
| Serveur pas démarré / port occupé | Avoir un `npm run build && npm start` déjà lancé et testé **avant** la session, dans un terminal dédié, avec `http://localhost:3000` ouvert dans un onglet prêt. |
| Compte de démo à créer en live échoue (typo, lenteur) | Avoir un compte de démo pré-créé avec une progression avancée (niveau débloqué, crédits, mods achetés) pour ne pas perdre de temps si l'inscription live bug. |
| Bug visuel/gameplay imprévu en live | Ne pas s'arrêter dessus : dire "comportement connu, tracké" (cohérent avec `TESTING.md`) et enchaîner sur le point suivant du script. |
| Manque de temps | Le script est découpé en blocs indépendants (2 → 3 → 4) : sacrifier la partie 4 (progression) en premier si le temps manque, jamais la partie 3 (IA) qui est le point différenciant. |
| Ordinateur/projecteur qui plante | Avoir 2-3 captures d'écran ou un court GIF des étapes clés en backup local (pas besoin de réseau), pour pouvoir continuer le discours sans le live. |

## Checklist avant la démo

- [ ] `npm run build && npm start` lancé et vérifié sur la machine de démo
- [ ] Compte de démo de secours créé avec progression
- [ ] Connexion réseau testée (ou fallback IA accepté)
- [ ] Volume/résolution de l'écran de projection vérifiés (thème CRT
      lisible, pas trop sombre en salle éclairée)
- [ ] Chrono du script fait au moins une fois à voix haute
