package fr.umontpellier.iut.rails;

import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class TestUtils {
    /**
     * Renvoie un attribut d'un objet à partir de son nom.
     * La méthode cherche s'il existe un champ déclaré dans la classe de l'objet et
     * si ce n'est pas le cas remonte dans la hiérarchie des classes jusqu'à trouver
     * un champ avec le nom voulu ou renvoie null.
     * 
     * @param obj  objet dont on cherche le champ
     * @param name nom du champ
     * @return le champ de l'objet, avec un type statique Object
     */
    public static Object getAttribute(Object obj, String name) {
        Class c = obj.getClass();
        while (c != null) {
            try {
                Field field = c.getDeclaredField(name);
                field.setAccessible(true);
                return field.get(obj);
            } catch (NoSuchFieldException e) {
                c = c.getSuperclass();
                continue;
            } catch (IllegalAccessException e) {
                e.printStackTrace();
                return null;
            }
        }
        return null;
    }

    /**
     * Met les cartes wagon passées en argument dans la main d'un joueur (la main
     * est vidée avant, pour contenir exactement les cartes indiquées)
     * 
     * @param joueur le joueur dont on fixe les cartes en main
     */
    public static void setCartesWagon(Joueur joueur, CouleurWagon... cartesWagon) {
        while (!joueur.getCartesWagon().isEmpty()) {
            joueur.getCartesWagon().remove(0);
        }
        Collections.addAll(joueur.getCartesWagon(), cartesWagon);
    }

    /**
     * Teste si la liste de CouleurWagon passée en premier argument contient
     * exactement les couleurs indiquées, indépendamment de leur ordre
     * 
     * @param liste    la liste de CouleurWagon à tester
     * @param couleurs les couleurs que la liste devrait contenir (avec leur
     *                 multiplicité)
     * @return true si la liste contient exactement les couleurs indiquées, avec
     *         leur multiplicité, false sinon
     */
    public static boolean contientExactement(List<CouleurWagon> liste, CouleurWagon... couleurs) {
        if (liste.size() != couleurs.length) {
            return false;
        }
        Arrays.sort(couleurs);
        Collections.sort(liste);

        for (int i = 0; i < couleurs.length; i++) {
            if (couleurs[i] != liste.get(i)) {
                return false;
            }
        }
        return true;
    }
}
