from typing import Any, Text, Dict, List
import unicodedata
import re
import random
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet

# ─────────────────────────────────────────────────────────────────────────────
# Dicas e explicações por TÓPICO (visão geral)
# ─────────────────────────────────────────────────────────────────────────────

DICAS = {
    "algoritmos": "💡 Pense em algoritmo como uma receita de bolo. Tem ingredientes (entradas), passos ordenados (processamento) e um resultado (saída). Todo algoritmo deve ser finito e sem ambiguidade — cada passo tem significado único.",
    "variaveis": "💡 Variável é como uma caixa etiquetada na memória. Tem nome (etiqueta), tipo (formato da caixa) e valor (conteúdo). O tipo define o que pode ser armazenado: int para inteiros, float para decimais, string para texto, bool para verdadeiro/falso.",
    "entrada_saida": "💡 Siga o modelo IPO — Input, Process, Output. Em Python: input() sempre retorna string, então use int() ou float() para converter antes de calcular. print() exibe o resultado formatado.",
    "operadores": "💡 Três tipos: aritméticos (+, -, *, /, %) fazem cálculos. Relacionais (==, !=, >, <) comparam e retornam True/False. Lógicos (and, or, not) combinam condições booleanas. Atenção: == compara, = atribui!",
    "condicionais": "💡 Condicional é 'se isso, então aquilo'. O if verifica uma condição booleana. Se verdadeira, executa o bloco. O else executa quando falsa. elif adiciona condições extras. Sempre use == para comparar valores.",
    "repeticao": "💡 Use while quando não sabe quantas repetições (baseado em condição). Use for quando sabe quantas vezes ou percorre uma sequência. Todo loop precisa de uma condição de parada — sem ela é loop infinito!",
    "funcoes": "💡 Função é um bloco reutilizável com nome, parâmetros e retorno. Parâmetros são variáveis locais — só existem dentro da função. Use return para devolver um valor. Sem return, a função retorna None.",
    "vetores": "💡 Lista em Python é uma sequência indexada a partir de 0. lista[0] é o primeiro, lista[-1] é o último. len(lista) retorna o tamanho. Para percorrer use for item in lista. Matrizes são listas de listas.",
}

EXPLICACOES = {
    "algoritmos": "Algoritmo é uma sequência finita de passos bem definidos para resolver um problema. Características essenciais: deve ter começo e fim, cada passo deve ser não-ambíguo, e deve funcionar para qualquer entrada válida.",
    "variaveis": "Variáveis armazenam dados na memória durante a execução. Em Python você não declara o tipo — ele é inferido automaticamente. nome = 'João' cria uma string, idade = 20 cria um int, altura = 1.75 cria um float.",
    "entrada_saida": "Entrada é receber dados do usuário (input()). Processamento é manipular esses dados. Saída é apresentar o resultado (print()). O modelo IPO (Input-Process-Output) guia a estrutura de qualquer programa.",
    "operadores": "Operadores são símbolos que realizam operações. O mais confundido é == (comparação) vs = (atribuição). if x = 5 é erro de sintaxe; if x == 5 verifica se x vale 5. Operadores lógicos: and exige os dois verdadeiros, or exige pelo menos um.",
    "condicionais": "O if avalia uma expressão que resulta em True ou False. Blocos são definidos por indentação (4 espaços). if → bloco obrigatório; elif → bloco opcional repetível; else → bloco opcional final que captura tudo que não entrou antes.",
    "repeticao": "while repete enquanto a condição for verdadeira — cuidado com loop infinito se a condição nunca mudar. for percorre itens de uma sequência (lista, range, string). range(5) gera 0,1,2,3,4. break sai do loop, continue pula para a próxima iteração.",
    "funcoes": "Funções evitam repetição de código. def nome(param1, param2): define a função. Ao chamar: resultado = nome(valor1, valor2). Escopo: variáveis dentro da função não existem fora. Use return para devolver dados ao chamador.",
    "vetores": "Listas em Python são dinâmicas (crescem e diminuem). Criação: numeros = [1, 2, 3]. Acesso: numeros[0]. Adição: numeros.append(4). Remoção: numeros.remove(2) ou numeros.pop(0). Percurso: for n in numeros ou for i in range(len(numeros)).",
}

# ─────────────────────────────────────────────────────────────────────────────
# Base de conhecimento por CONCEITO (perguntas "o que é X?")
# Cada entrada: lista de palavras-chave para casar + resposta detalhada.
# ─────────────────────────────────────────────────────────────────────────────

CONCEITOS = [
    (["variavel", "variaveis"], "📦 **Variável** é um espaço nomeado na memória que guarda um valor. Pense numa caixa com etiqueta: o nome é a etiqueta, o valor é o conteúdo. Ex: `idade = 20` cria uma variável chamada idade com o valor 20. O valor pode mudar durante a execução."),
    (["constante", "constantes"], "🔒 **Constante** é como uma variável, mas seu valor NÃO pode mudar depois de definido. Serve para valores fixos do programa, como `PI = 3.14159`. Por convenção, costuma-se escrever o nome em MAIÚSCULAS. Tentar alterar uma constante gera erro (em linguagens que as suportam de fato)."),
    (["tipo", "tipagem", "tipos de dado"], "🏷️ **Tipos de dado** definem que tipo de valor uma variável guarda: `int` (inteiros: 5), `float` (decimais: 3.14), `string`/`str` (texto: 'oi'), `bool` (True/False). Em Python o tipo é inferido automaticamente pelo valor que você atribui."),
    (["int", "inteiro"], "🔢 **int** (inteiro) é o tipo para números sem casas decimais: 0, 5, -42. Operações: soma, subtração, multiplicação. Atenção: `7 // 2` dá 3 (divisão inteira), enquanto `7 / 2` dá 3.5 (vira float)."),
    (["float", "decimal", "ponto flutuante"], "🔣 **float** é o tipo para números com casas decimais: 3.14, 1.5, -0.001. Use quando precisa de precisão fracionária, como notas (7.5), preços (9.90) ou medidas (1.75)."),
    (["string", "str", "texto", "cadeia"], "🔤 **string** (str) é o tipo para texto: 'João', \"Olá mundo\". Fica entre aspas. Pode concatenar com +: 'a' + 'b' = 'ab'. Cuidado: `input()` sempre retorna string, por isso precisa de `int()` para fazer contas."),
    (["bool", "booleano", "verdadeiro", "falso"], "✅ **bool** (booleano) só tem dois valores: `True` (verdadeiro) ou `False` (falso). É o resultado de comparações (`5 > 3` é True) e controla condicionais e loops."),
    (["algoritmo"], "📋 **Algoritmo** é uma sequência finita e ordenada de passos para resolver um problema. Como uma receita: tem entradas (ingredientes), processamento (modo de preparo) e saída (prato pronto). Deve ser finito e sem ambiguidade."),
    (["pseudocodigo", "pseudo codigo"], "📝 **Pseudocódigo** é uma forma de escrever algoritmos em linguagem próxima ao português, sem a sintaxe rígida de uma linguagem real. Serve para planejar a lógica antes de programar de fato."),
    (["fluxograma"], "🔷 **Fluxograma** é a representação visual de um algoritmo com símbolos: retângulo = ação, losango = decisão (if), oval = início/fim, setas = fluxo. Ajuda a enxergar a lógica antes de codar."),
    (["input", "entrada", "ler dados"], "⌨️ **input()** lê dados digitados pelo usuário e SEMPRE retorna uma string. Para usar como número, converta: `idade = int(input())`. Sem a conversão, '5' + '3' viraria '53' em vez de 8."),
    (["print", "saida", "imprimir", "exibir"], "🖨️ **print()** exibe informações na tela. Pode mostrar texto, variáveis ou expressões: `print('Total:', total)`. É a forma mais comum de saída de dados de um programa."),
    (["operador aritmetico", "aritmetico", "calculo", "soma", "multiplicacao"], "➕ **Operadores aritméticos** fazem cálculos: `+` soma, `-` subtrai, `*` multiplica, `/` divide, `//` divisão inteira, `%` resto, `**` potência. Ex: `2 ** 3` = 8."),
    (["operador relacional", "relacional", "comparacao", "comparar"], "⚖️ **Operadores relacionais** comparam valores e retornam True/False: `==` igual, `!=` diferente, `>` maior, `<` menor, `>=` maior ou igual, `<=` menor ou igual. Muito usados em condicionais."),
    (["operador logico", "logico", "and", "or", "not"], "🔗 **Operadores lógicos** combinam condições: `and` (E — exige as duas verdadeiras), `or` (OU — basta uma), `not` (NÃO — inverte). Ex: `idade >= 18 and tem_carteira`."),
    (["modulo", "resto", "porcentagem", "%"], "➗ **Módulo (%)** retorna o RESTO de uma divisão. `10 % 3` = 1 (10 = 3×3 + 1). Uso clássico: descobrir se um número é par — `n % 2 == 0` é True para pares."),
    (["diferenca entre == e =", "igual igual", "== =", "comparacao atribuicao"], "❗ `=` **atribui** um valor (`x = 5` coloca 5 em x). `==` **compara** (`x == 5` pergunta se x vale 5, retorna True/False). Usar `=` dentro de um `if` é erro de sintaxe. Essa é a confusão nº1 de iniciantes!"),
    (["if", "condicional", "se entao"], "🔀 **if** (se) executa um bloco apenas se a condição for verdadeira. `if nota >= 7:` → executa o bloco indentado abaixo só quando nota for 7 ou mais. É a base da tomada de decisão."),
    (["else", "senao"], "↩️ **else** (senão) define o que fazer quando a condição do `if` é falsa. `if x > 0: ... else: ...` — o bloco do else roda quando x NÃO é maior que 0. É opcional."),
    (["elif", "senao se"], "🔢 **elif** (senão se) testa condições adicionais em sequência. Python avalia de cima para baixo e PARA na primeira verdadeira. Útil para faixas: nota >= 9 (A), elif >= 7 (B), elif >= 5 (C), else (D)."),
    (["while", "enquanto"], "🔁 **while** (enquanto) repete um bloco ENQUANTO a condição for verdadeira. Use quando não sabe quantas repetições serão necessárias. Cuidado: se a condição nunca ficar falsa, vira loop infinito!"),
    (["for", "para cada"], "🔂 **for** (para) repete um número conhecido de vezes ou percorre uma sequência. `for i in range(5):` roda 5 vezes (i = 0,1,2,3,4). `for item in lista:` percorre cada elemento."),
    (["range"], "📏 **range(n)** gera uma sequência de números de 0 até n-1. `range(5)` → 0,1,2,3,4 (o 5 NÃO entra!). `range(1, 5)` → 1,2,3,4. `range(0, 10, 2)` → 0,2,4,6,8 (passo de 2)."),
    (["break"], "⛔ **break** interrompe o loop imediatamente, mesmo que a condição ainda seja verdadeira. Útil para parar uma busca assim que encontra o que procura."),
    (["continue"], "⏭️ **continue** pula para a próxima iteração do loop, ignorando o resto do bloco atual. Diferente do break, o loop CONTINUA — só pula esta volta."),
    (["loop infinito"], "♾️ **Loop infinito** acontece quando a condição de parada nunca fica falsa. Causa comum: esquecer de atualizar a variável de controle (ex: faltou `i = i + 1` num while). O programa trava repetindo para sempre."),
    (["funcao", "funcoes", "def"], "🧩 **Função** é um bloco de código reutilizável com nome. Define com `def nome(parametros):` e devolve resultado com `return`. Evita repetir código: escreva uma vez, chame várias. Ex: `def dobro(x): return x * 2`."),
    (["parametro", "argumento"], "🎯 **Parâmetro** é a variável que a função recebe (na definição: `def soma(a, b)`). **Argumento** é o valor real passado na chamada (`soma(3, 4)` — 3 e 4 são argumentos). Parâmetros só existem dentro da função."),
    (["return", "retorno", "retornar"], "↪️ **return** devolve um valor de uma função para quem a chamou. `def quadrado(n): return n*n` — o resultado pode ser guardado: `x = quadrado(4)`. Sem return, a função retorna `None`. Diferente de print (que só exibe)!"),
    (["escopo"], "🔒 **Escopo** define onde uma variável existe. Variáveis criadas dentro de uma função são LOCAIS — só existem ali e somem quando a função termina. Por isso uma função não enxerga variáveis internas de outra."),
    (["recursao", "recursiva", "recursivo"], "🔄 **Recursão** é quando uma função chama a si mesma para resolver um problema menor, até chegar a um caso base (que para a recursão). Ex: fatorial — `fat(n) = n * fat(n-1)`, com `fat(0) = 1` como caso base."),
    (["vetor", "lista", "array"], "📚 **Vetor/Lista** é uma coleção ordenada de valores, indexada a partir de 0. `v = [10, 20, 30]` — `v[0]` é 10, `v[1]` é 20. Percorre com for, adiciona com append, tamanho com len(v)."),
    (["indice", "index", "posicao"], "🔢 **Índice** é a posição de um elemento na lista, começando em 0. Numa lista de 5 elementos, os índices vão de 0 a 4. `v[-1]` acessa o último de forma prática. Índice inválido gera erro 'index out of bounds'."),
    (["matriz"], "🔲 **Matriz** é uma lista de listas (bidimensional), organizada em linhas e colunas. `m = [[1,2],[3,4]]`. Acesso com dois índices: `m[0][1]` = 2 (linha 0, coluna 1). Uma matriz 3×4 tem 12 elementos."),
    (["append", "adicionar elemento"], "➕ **append()** adiciona um elemento ao FINAL de uma lista. `v = [1,2]; v.append(3)` → `[1,2,3]`. (Em JavaScript o equivalente é push.) Para inserir em posição específica use `insert(indice, valor)`."),
]

# Diferenças entre conceitos comumente confundidos.
# Estrutura: (grupoA, grupoB, resposta) — casa se QUALQUER chave de cada grupo
# aparecer na mensagem (permite sinônimos como "pseudoalgoritmo"/"pseudocódigo").
DIFERENCAS = [
    (["while"], ["for"], "🔁 **while × for**: use `for` quando sabe quantas vezes repetir ou vai percorrer uma sequência (`for i in range(10)`). Use `while` quando o número de repetições depende de uma condição que muda durante a execução (`while saldo > 0`)."),
    (["=="], ["="], "❗ **== × =**: `=` ATRIBUI um valor a uma variável (`x = 5`). `==` COMPARA dois valores e retorna True/False (`x == 5`). Em condicionais sempre use `==`. Confundir os dois é o erro mais comum de quem começa."),
    (["int", "inteiro"], ["float", "decimal"], "🔢 **int × float**: `int` guarda inteiros (5, -3, 100). `float` guarda decimais (3.14, 7.5). Use float quando precisa de fração — notas, preços, medidas. `int(7.9)` trunca para 7 (não arredonda)."),
    (["parametro"], ["argumento"], "🎯 **parâmetro × argumento**: parâmetro é a variável na DEFINIÇÃO da função (`def f(x)` — x é parâmetro). Argumento é o valor passado na CHAMADA (`f(10)` — 10 é argumento). Mesmo conceito, momentos diferentes."),
    (["break"], ["continue"], "⛔ **break × continue**: `break` SAI do loop completamente. `continue` PULA só a iteração atual e continua o loop. Pense: break = parar tudo; continue = pular esta volta."),
    (["print"], ["return"], "↪️ **print × return**: `print` EXIBE na tela (visual, para o usuário ver). `return` DEVOLVE um valor para o código usar (`x = soma(2,3)`). Uma função pode calcular com return e você decide se imprime ou não depois."),
    (["lista"], ["tupla"], "📚 **lista × tupla**: `lista` `[1,2,3]` é mutável — pode adicionar/remover/alterar. `tupla` `(1,2,3)` é imutável — fixa após criada. Use tupla para dados que não devem mudar (ex: coordenadas)."),
    (["variavel", "variaveis"], ["constante", "constantes"], "🔁 **variável × constante**: ambas guardam um valor na memória. A diferença é que o valor de uma **variável** PODE mudar durante a execução (`idade = 20` e depois `idade = 21`), enquanto o de uma **constante** é FIXO após definido (`PI = 3.14`). Use constante para valores que nunca mudam; variável para o que precisa variar."),
    (["algoritmo"], ["pseudocodigo", "pseudo codigo", "pseudoalgoritmo", "pseudo algoritmo"], "📋 **algoritmo × pseudocódigo**: o **algoritmo** é a *solução lógica* — a sequência de passos para resolver um problema, independente de como você a escreve. O **pseudocódigo** é uma *forma de escrever* esse algoritmo, em linguagem próxima ao português e sem a sintaxe rígida de uma linguagem real. Ou seja: o algoritmo é a ideia; o pseudocódigo é uma maneira de representá-la no papel antes de programar."),
]


def _normalizar(texto: str) -> str:
    """Remove acentos e deixa minúsculo para casamento robusto."""
    texto = texto.lower()
    texto = unicodedata.normalize("NFD", texto)
    return "".join(c for c in texto if unicodedata.category(c) != "Mn")


def _contem(msg_norm: str, chave: str) -> bool:
    """Casa a chave na mensagem. Palavras usam fronteira (\\b) para evitar
    falsos positivos (ex: 'or' dentro de 'operador'); símbolos casam direto."""
    chave_norm = _normalizar(chave)
    if not chave_norm:
        return False
    if chave_norm[0].isalnum():
        return re.search(r"\b" + re.escape(chave_norm) + r"\b", msg_norm) is not None
    return chave_norm in msg_norm  # símbolos como ==, =, %


def _buscar_conceito(mensagem: str):
    """Retorna a melhor explicação de conceito para a mensagem, ou None."""
    msg = _normalizar(mensagem)
    eh_diferenca = "diferenc" in msg

    # 1) Pergunta de diferença? ("qual a diferença entre X e Y")
    if eh_diferenca:
        for grupoA, grupoB, resposta in DIFERENCAS:
            casaA = any(_contem(msg, k) for k in grupoA)
            casaB = any(_contem(msg, k) for k in grupoB)
            if casaA and casaB:
                return resposta

    # 2) Conceito específico — pontua por nº de palavras-chave casadas
    melhor, melhor_score = None, 0
    for chaves, resposta in CONCEITOS:
        score = sum(1 for k in chaves if _contem(msg, k))
        if score > melhor_score:
            melhor, melhor_score = resposta, score

    # 3) Era pergunta de diferença mas não há par conhecido:
    #    não devolve a definição de um conceito só (seria enganoso).
    if eh_diferenca and melhor is not None:
        return ("🤔 Não tenho uma comparação direta pronta para esses dois conceitos. "
                "Posso explicar cada um separadamente — pergunte, por exemplo, "
                "\"o que é um algoritmo?\" e depois \"o que é pseudocódigo?\".")

    return melhor


GENERICA_DICA = "💡 Dica geral: leia a questão com calma e identifique o que está sendo pedido. Elimine as alternativas obviamente erradas primeiro. Se ainda não sabe, o sistema vai reapresentar a questão para reforçar!"
GENERICA_EXPLICACAO = "Posso explicar! Pergunte sobre um conceito específico — por exemplo: \"o que é uma variável?\", \"para que serve o return?\" ou \"qual a diferença entre while e for?\"."


# ─────────────────────────────────────────────────────────────────────────────
# Exemplos de código sob demanda ("me dá um exemplo de X")
# ─────────────────────────────────────────────────────────────────────────────

EXEMPLOS = [
    (["variavel", "variaveis", "tipo"], "📝 **Exemplo — variáveis**\n```python\nnome = \"Ana\"      # string\nidade = 20         # int\naltura = 1.75      # float\nestuda = True      # bool\nprint(nome, idade)\n```\nCada variável guarda um valor de um tipo. O valor pode mudar: `idade = 21`."),
    (["operador", "operadores", "aritmetico", "relacional", "logico", "modulo"], "📝 **Exemplo — operadores**\n```python\nx = 10\ny = 3\nprint(x + y)   # 13  (soma)\nprint(x % y)   # 1   (resto)\nprint(x > y)   # True (comparação)\nprint(x > 5 and y < 5)  # True (lógico)\n```"),
    (["condicional", "condicionais", "if", "else", "elif", "se"], "📝 **Exemplo — condicional**\n```python\nnota = 7\nif nota >= 9:\n    print(\"A\")\nelif nota >= 7:\n    print(\"B\")\nelse:\n    print(\"C\")\n# imprime: B\n```\nO Python testa de cima para baixo e para na primeira verdadeira."),
    (["for", "repeticao", "loop", "range"], "📝 **Exemplo — for**\n```python\nsoma = 0\nfor i in range(1, 5):   # i = 1, 2, 3, 4\n    soma = soma + i\nprint(soma)   # 10\n```\nUse `for` quando sabe quantas vezes repetir."),
    (["while", "enquanto"], "📝 **Exemplo — while**\n```python\ni = 1\nwhile i <= 3:\n    print(i)\n    i = i + 1\n# imprime 1, 2, 3\n```\nNão esqueça de atualizar `i`, senão vira loop infinito!"),
    (["funcao", "funcoes", "def", "return"], "📝 **Exemplo — função**\n```python\ndef dobro(x):\n    return x * 2\n\nresultado = dobro(5)\nprint(resultado)   # 10\n```\nA função recebe `x`, calcula e devolve o resultado com `return`."),
    (["vetor", "vetores", "lista", "listas", "array", "indice", "matriz"], "📝 **Exemplo — lista (vetor)**\n```python\nnotas = [7, 8, 9]\nprint(notas[0])    # 7  (primeiro, índice 0)\nnotas.append(10)   # adiciona ao final\nprint(len(notas))  # 4\nfor n in notas:    # percorre todos\n    print(n)\n```"),
    (["entrada", "saida", "input", "print"], "📝 **Exemplo — entrada e saída**\n```python\na = int(input())   # lê e converte para número\nb = int(input())\nprint(\"Soma:\", a + b)\n```\nLembre: `input()` sempre retorna texto, por isso o `int()`."),
    (["algoritmo", "algoritmos", "pseudocodigo"], "📝 **Exemplo — algoritmo (pseudocódigo)**\n```\nALGORITMO media\n  LEIA a, b\n  media ← (a + b) / 2\n  ESCREVA media\nFIM\n```\nEntrada → processamento → saída (modelo IPO)."),
]

EXEMPLO_GENERICO = "Posso mostrar um exemplo! Diga de qual conceito — por exemplo: \"exemplo de função\", \"exemplo de for\" ou \"exemplo de condicional\"."


# ─────────────────────────────────────────────────────────────────────────────
# Aplicações no mundo real ("pra que serve X na prática?")
# ─────────────────────────────────────────────────────────────────────────────

APLICACOES = [
    (["variavel", "variaveis"], "🌍 **Na prática:** variáveis guardam tudo que um app precisa lembrar — seu nome de login, o total do carrinho de compras, sua pontuação num jogo. Sem variáveis, o programa não teria memória do que está acontecendo."),
    (["condicional", "condicionais", "if", "else", "elif"], "🌍 **Na prática:** condicionais são as decisões de todo sistema. \"Se a senha está correta, entra; senão, mostra erro.\" \"Se o saldo é suficiente, aprova a compra.\" Todo app que reage ao usuário usa condicionais o tempo todo."),
    (["for", "while", "repeticao", "loop"], "🌍 **Na prática:** repetição é como processamos muitos dados. Enviar e-mail para 1000 clientes, somar todas as vendas do mês, mostrar cada post do feed — tudo isso é um loop percorrendo uma lista."),
    (["funcao", "funcoes", "return"], "🌍 **Na prática:** funções organizam e reaproveitam código. O botão \"calcular frete\" de uma loja é uma função chamada toda vez que alguém finaliza a compra — escrita uma vez, usada milhares de vezes."),
    (["vetor", "vetores", "lista", "listas", "array", "matriz"], "🌍 **Na prática:** listas guardam coleções — os produtos de um carrinho, as mensagens de um chat, os contatos do celular. Praticamente todo app trabalha com listas de coisas."),
    (["operador", "operadores"], "🌍 **Na prática:** operadores fazem as contas e comparações de tudo — calcular o desconto (aritmético), verificar se você é maior de idade (relacional), checar se está logado E é admin (lógico)."),
    (["entrada", "saida", "input", "print"], "🌍 **Na prática:** entrada e saída são a conversa do programa com o mundo — um formulário recebe seus dados (entrada), o sistema processa e mostra o resultado na tela (saída). Toda interação usuário-programa é isso."),
    (["algoritmo", "algoritmos"], "🌍 **Na prática:** algoritmos estão em tudo — o caminho que o GPS calcula, a ordem dos vídeos recomendados, o ranking de busca do Google. São receitas de passos para resolver problemas reais."),
]

APLICACAO_GENERICA = "Quase tudo em programação tem uso prático! Diga de qual conceito você quer saber a aplicação — por exemplo: \"pra que serve condicional?\" ou \"onde uso vetores?\"."


def _buscar_em(mensagem: str, tabela) -> str:
    """Casamento por palavra-chave genérico (mesma lógica de _buscar_conceito)."""
    msg = _normalizar(mensagem)
    melhor, melhor_score = None, 0
    for chaves, resposta in tabela:
        score = sum(1 for k in chaves if _contem(msg, k))
        if score > melhor_score:
            melhor, melhor_score = resposta, score
    return melhor


# ─────────────────────────────────────────────────────────────────────────────
# Banco de quiz para praticar PELO CHAT
# ─────────────────────────────────────────────────────────────────────────────

QUIZ = {
    "algoritmos": [
        {"q": "O que é um algoritmo?", "opts": ["Uma linguagem de programação", "Uma sequência de passos para resolver um problema", "Um tipo de variável", "Um erro de código"], "correct": 1, "explain": "Algoritmo é a sequência lógica e finita de passos para resolver um problema."},
        {"q": "Qual a ordem correta das fases de um algoritmo?", "opts": ["Saída → Processamento → Entrada", "Entrada → Processamento → Saída", "Processamento → Entrada → Saída", "Entrada → Saída → Processamento"], "correct": 1, "explain": "Modelo IPO: primeiro recebe dados, processa, depois exibe o resultado."},
        {"q": "Um algoritmo deve ser sempre:", "opts": ["Infinito", "Ambíguo", "Finito e sem ambiguidade", "Escrito em inglês"], "correct": 2, "explain": "Todo algoritmo deve terminar e ter cada passo com significado único."},
    ],
    "variaveis": [
        {"q": "O que é uma variável?", "opts": ["Um erro no código", "Um espaço na memória que guarda um valor", "Um tipo de loop", "Uma função"], "correct": 1, "explain": "Variável é um espaço nomeado na memória que armazena um valor."},
        {"q": "Qual tipo é mais adequado para a nota 7.5?", "opts": ["int", "float", "bool", "string"], "correct": 1, "explain": "float armazena números com casas decimais, como 7.5."},
        {"q": "O que `bool` armazena?", "opts": ["Texto", "Números decimais", "Verdadeiro ou falso", "Listas"], "correct": 2, "explain": "bool só tem dois valores: True (verdadeiro) ou False (falso)."},
    ],
    "entrada_saida": [
        {"q": "Em Python, o que input() sempre retorna?", "opts": ["Um número inteiro", "Um número decimal", "Uma string (texto)", "Um booleano"], "correct": 2, "explain": "input() sempre retorna texto — use int() ou float() para converter."},
        {"q": "Qual função exibe informação na tela?", "opts": ["input()", "print()", "read()", "show()"], "correct": 1, "explain": "print() é a função de saída padrão em Python."},
    ],
    "operadores": [
        {"q": "Quanto é 10 % 3?", "opts": ["3", "1", "0", "3.33"], "correct": 1, "explain": "% retorna o resto da divisão: 10 = 3×3 + 1, então o resto é 1."},
        {"q": "Qual operador COMPARA dois valores?", "opts": ["=", "==", "+", "!"], "correct": 1, "explain": "== compara; = atribui. Confundir os dois é o erro nº 1 de iniciantes."},
        {"q": "O resultado de (5 > 3) é:", "opts": ["5", "3", "True", "False"], "correct": 2, "explain": "Operadores relacionais retornam True ou False. 5 é maior que 3, então True."},
    ],
    "condicionais": [
        {"q": "Se x = 8, o que o código imprime?\nif x > 10:\n    print('A')\nelse:\n    print('B')", "opts": ["A", "B", "A e B", "Nada"], "correct": 1, "explain": "8 não é maior que 10, então a condição é falsa e executa o else: 'B'."},
        {"q": "Para que serve o elif?", "opts": ["Encerrar o programa", "Testar condições adicionais em sequência", "Criar um loop", "Declarar variável"], "correct": 1, "explain": "elif testa novas condições; a avaliação para na primeira verdadeira."},
        {"q": "Como verificar se um número é par?", "opts": ["n / 2 == 0", "n % 2 == 0", "n * 2 == 0", "n + 2 == 0"], "correct": 1, "explain": "Um número é par quando o resto da divisão por 2 é zero: n % 2 == 0."},
    ],
    "repeticao": [
        {"q": "Quantas vezes 'Oi' é impresso?\nfor i in range(3):\n    print('Oi')", "opts": ["2", "3", "4", "Infinitas"], "correct": 1, "explain": "range(3) gera 0, 1, 2 — três valores, então 3 repetições."},
        {"q": "Quando usar while em vez de for?", "opts": ["Quando sei quantas vezes repetir", "Quando a repetição depende de uma condição que muda", "Nunca", "Para percorrer listas"], "correct": 1, "explain": "while é ideal quando não se sabe o número de repetições de antemão."},
        {"q": "O que causa um loop infinito num while?", "opts": ["Usar range", "Não atualizar a variável de controle", "Usar print", "Ter poucas iterações"], "correct": 1, "explain": "Se a condição nunca fica falsa (ex: esquecer i = i + 1), o loop nunca termina."},
    ],
    "funcoes": [
        {"q": "O que este código imprime?\ndef dobro(x):\n    return x * 2\nprint(dobro(5))", "opts": ["5", "10", "25", "Erro"], "correct": 1, "explain": "dobro(5) calcula 5*2 = 10 e retorna esse valor."},
        {"q": "Qual a diferença entre return e print?", "opts": ["São iguais", "return devolve um valor; print só exibe", "print devolve valor", "return exibe na tela"], "correct": 1, "explain": "return entrega um valor para o código usar; print apenas mostra na tela."},
        {"q": "Parâmetros de uma função são:", "opts": ["Variáveis globais", "Variáveis locais que só existem na função", "Sempre números", "Constantes"], "correct": 1, "explain": "Parâmetros são locais — só existem dentro da função."},
    ],
    "vetores": [
        {"q": "Numa lista [10, 20, 30], o que é lista[1]?", "opts": ["10", "20", "30", "1"], "correct": 1, "explain": "Índices começam em 0: lista[0]=10, lista[1]=20."},
        {"q": "Qual método adiciona um elemento ao final da lista?", "opts": ["add()", "append()", "insert()", "push()"], "correct": 1, "explain": "Em Python, append() adiciona ao final da lista."},
        {"q": "O que len([5, 8, 2, 1]) retorna?", "opts": ["5", "4", "16", "1"], "correct": 1, "explain": "len() retorna a quantidade de elementos: aqui são 4."},
    ],
}

LETRAS = ["a", "b", "c", "d"]


class ActionSetTopic(Action):
    def name(self) -> Text:
        return "action_set_topic"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        topico = tracker.get_slot("topico_atual") or next(tracker.get_latest_entity_values("topico"), None)
        if topico:
            dispatcher.utter_message(text=f"Entendido! Estou aqui para te ajudar com **{topico.replace('_', ' ').title()}**. Pode pedir uma dica ou perguntar sobre qualquer conceito!")
            return [SlotSet("topico_atual", topico)]
        dispatcher.utter_message(text="Olá! Estou aqui para te ajudar. Pode pedir dicas ou tirar dúvidas sobre qualquer conceito de programação!")
        return []


class ActionGiveHint(Action):
    def name(self) -> Text:
        return "action_give_hint"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        topico = tracker.get_slot("topico_atual")
        dica = DICAS.get(topico, GENERICA_DICA) if topico else GENERICA_DICA
        dispatcher.utter_message(text=dica)
        return []


class ActionExplain(Action):
    def name(self) -> Text:
        return "action_explain"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        # Primeiro tenta identificar um conceito específico na própria mensagem
        mensagem = tracker.latest_message.get("text", "") or ""
        conceito = _buscar_conceito(mensagem)
        if conceito:
            dispatcher.utter_message(text=conceito)
            return []

        # Senão, explica o tópico atual em visão geral
        topico = tracker.get_slot("topico_atual")
        explicacao = EXPLICACOES.get(topico, GENERICA_EXPLICACAO) if topico else GENERICA_EXPLICACAO
        dispatcher.utter_message(text=explicacao)
        return []


class ActionExplainConcept(Action):
    def name(self) -> Text:
        return "action_explain_concept"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        mensagem = tracker.latest_message.get("text", "") or ""
        conceito = _buscar_conceito(mensagem)
        if conceito:
            dispatcher.utter_message(text=conceito)
            return []

        # Não identificou o conceito — orienta o aluno
        dispatcher.utter_message(
            text="Não tenho certeza de qual conceito você quer entender 🤔 Tente nomear o conceito, por exemplo: \"o que é uma variável?\", \"como funciona o for?\" ou \"diferença entre == e =\"."
        )
        return []


class ActionDarExemplo(Action):
    def name(self) -> Text:
        return "action_dar_exemplo"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        mensagem = tracker.latest_message.get("text", "") or ""
        # 1) Conceito citado na própria mensagem
        exemplo = _buscar_em(mensagem, EXEMPLOS)
        # 2) Senão, exemplo do tópico atual
        if not exemplo:
            topico = tracker.get_slot("topico_atual")
            if topico:
                exemplo = _buscar_em(topico.replace("_", " "), EXEMPLOS)
        dispatcher.utter_message(text=exemplo or EXEMPLO_GENERICO)
        return []


class ActionAplicacao(Action):
    def name(self) -> Text:
        return "action_aplicacao"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        mensagem = tracker.latest_message.get("text", "") or ""
        aplic = _buscar_em(mensagem, APLICACOES)
        if not aplic:
            topico = tracker.get_slot("topico_atual")
            if topico:
                aplic = _buscar_em(topico.replace("_", " "), APLICACOES)
        dispatcher.utter_message(text=aplic or APLICACAO_GENERICA)
        return []


class ActionFazerPergunta(Action):
    """Envia uma questão de múltipla escolha no chat e guarda a resposta certa."""
    def name(self) -> Text:
        return "action_fazer_pergunta"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        topico = tracker.get_slot("topico_atual")
        pool = QUIZ.get(topico) if topico and topico in QUIZ else None
        if not pool:
            # tópico sem banco específico → junta todas as questões
            pool = [q for qs in QUIZ.values() for q in qs]

        q = random.choice(pool)
        letra_correta = LETRAS[q["correct"]]
        texto_correto = q["opts"][q["correct"]]

        linhas = [f"📝 {q['q']}", ""]
        for i, opt in enumerate(q["opts"]):
            linhas.append(f"{LETRAS[i]}) {opt}")
        linhas.append("")
        linhas.append("Responda com a letra (a, b, c ou d).")

        dispatcher.utter_message(text="\n".join(linhas))
        return [
            SlotSet("quiz_correta", letra_correta),
            SlotSet("quiz_resposta", texto_correto),
            SlotSet("quiz_explicacao", q["explain"]),
        ]


class ActionAvaliarQuiz(Action):
    """Compara a resposta do aluno (a/b/c/d) com a esperada e dá feedback."""
    def name(self) -> Text:
        return "action_avaliar_quiz"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        correta = tracker.get_slot("quiz_correta")
        if not correta:
            dispatcher.utter_message(
                text="Você ainda não tem uma pergunta em aberto 🙂 Diga \"me faça uma pergunta\" para começar a praticar!"
            )
            return []

        mensagem = _normalizar(tracker.latest_message.get("text", "") or "")
        # Extrai a primeira letra a/b/c/d isolada da resposta
        m = re.search(r"\b([abcd])\b", mensagem)
        if not m:
            dispatcher.utter_message(text="Não entendi sua resposta 🤔 Responda só com a letra: a, b, c ou d.")
            return []  # mantém o quiz aberto para nova tentativa

        escolha = m.group(1)
        resposta_texto = tracker.get_slot("quiz_resposta") or ""
        explicacao = tracker.get_slot("quiz_explicacao") or ""

        if escolha == correta:
            msg = f"✅ Isso mesmo! {explicacao}\n\nQuer outra? É só dizer \"mais uma\"."
        else:
            msg = (f"❌ Quase! A resposta certa é **{correta}) {resposta_texto}**.\n"
                   f"{explicacao}\n\nVamos tentar outra? Diga \"mais uma\".")

        dispatcher.utter_message(text=msg)
        # Limpa o estado do quiz
        return [
            SlotSet("quiz_correta", None),
            SlotSet("quiz_resposta", None),
            SlotSet("quiz_explicacao", None),
        ]
