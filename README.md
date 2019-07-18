# blocklypp
Dies ist eine innerhalb meiner Bachelorarbeit implementierte objektorientierte Erweiterung für Blockly.
Blockly gitHub: https://github.com/google/blockly.

Zum ausführen muss neben dem Blockly Repository auch die Google Closure Library geklont werden:
https://github.com/google/closure-library
Der Ordner der Closure Library muss im selben Ordner wie die Blockly Library liegen:
-BlocklyOrdner
  -blockly
  -closure-library

Zum Benutzen muss zu erst ein Klassenblöcke erstellt werden. Dieser kann über den Mutator um beliebig viele Attribute erweitert werden. Methoden befinden sich unter der Rubrik "Klasse", diese können in belibiger Anzahl zur Klasse hinzugefügt werden.

Für jede erstellte Klasse entsteht in der Toolbox einer "new" Block. Und unter "variablen" ein neuer "create Klasse variable..." Button. Über den Button kann eine neues Objekt der Klasse erstellt werden, dieses muss durch den "new" Block der Klasse zugewiesen werden. Dann können am Variablenblock die verschiedenen Methoden und Attribute der Klasse aufgerufen werden.
