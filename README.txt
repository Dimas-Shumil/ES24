ES24 — responsive pass 4 / ground-anchored scene

Что заменить в текущем проекте:
- index.html
- site/scss/home.scss
- site/scss/header.scss
- site/css/home.css
- site/css/home.min.css
- site/css/header.css
- site/css/header.min.css
- site/js/home.js

Что исправлено в pass 4:
- мотоциклы на экранах <1920px больше не привязаны к top относительно высоты viewport;
- основной байк, боковые байки и foreground-камни используют общую bottom/width-based геометрию;
- высокие экраны больше не создают дополнительный воздух между колёсами и камнями;
- добавлены отдельные корректировки для коротких ноутбуков, portrait tablet, телефонов и landscape;
- 1920px и >1920px не изменены.

CSS уже обновлён, Watch Sass для первой проверки не нужен.
Если затем правите SCSS локально — снова соберите CSS обычным Watch Sass.
