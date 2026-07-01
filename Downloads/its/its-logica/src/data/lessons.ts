import type { Lesson } from "../types";

/**
 * Lições por tópico — a camada de *exposição* (ensino antes da prática).
 * Cada lição tem: conceito em partes curtas (reduz carga cognitiva),
 * um exemplo resolvido passo a passo (worked example) e pontos-chave.
 */

export const LESSONS: Record<string, Lesson> = {
  algoritmos: {
    topicId: "algoritmos",
    intro: "Antes de programar, é preciso pensar na solução. Esse plano de passos é o algoritmo.",
    sections: [
      {
        heading: "O que é um algoritmo",
        body: "Algoritmo é uma sequência finita e ordenada de passos para resolver um problema. Como uma receita de bolo: tem ingredientes (entradas), um modo de preparo (processamento) e um prato pronto (saída).",
      },
      {
        heading: "Características essenciais",
        body: "Todo algoritmo deve ser finito (terminar em algum momento) e não ambíguo (cada passo tem um significado único e claro). 'Misture um pouco' é ambíguo; 'misture por 2 minutos' é preciso.",
      },
    ],
    example: {
      title: "Calcular a média de dois números (pseudocódigo)",
      code: "ALGORITMO media\n  LEIA a, b\n  media ← (a + b) / 2\n  ESCREVA media\nFIM",
      steps: [
        "LEIA a, b — recebe dois números do usuário (entrada).",
        "media ← (a + b) / 2 — soma os dois e divide por 2 (processamento).",
        "ESCREVA media — exibe o resultado calculado (saída).",
        "Repare no modelo IPO: Entrada → Processamento → Saída.",
      ],
    },
    keyPoints: [
      "Algoritmo é o plano lógico; o programa é sua implementação numa linguagem.",
      "Sempre segue o modelo IPO: Entrada → Processamento → Saída.",
      "Deve ser finito e sem ambiguidade.",
    ],
  },

  variaveis: {
    topicId: "variaveis",
    intro: "Programas precisam guardar dados na memória. Para isso usamos variáveis.",
    sections: [
      {
        heading: "O que é uma variável",
        body: "Variável é um espaço nomeado na memória que guarda um valor. Pense numa caixa com etiqueta: o nome é a etiqueta, o valor é o conteúdo. O valor pode mudar durante a execução.",
      },
      {
        heading: "Tipos de dado",
        body: "O tipo define o que a variável guarda: int (inteiros, 5), float (decimais, 3.14), string (texto, 'oi') e bool (True/False). Em Python o tipo é inferido automaticamente pelo valor atribuído.",
      },
    ],
    example: {
      title: "Declarando variáveis de tipos diferentes",
      code: "nome = \"Ana\"    # string (texto)\nidade = 20       # int (inteiro)\naltura = 1.75    # float (decimal)\nestuda = True    # bool (verdadeiro/falso)\nprint(nome, idade, altura, estuda)",
      steps: [
        "nome recebe um texto entre aspas → tipo string.",
        "idade recebe um número sem casas decimais → tipo int.",
        "altura recebe um número com decimais → tipo float.",
        "estuda recebe True → tipo bool. O print exibe os quatro valores.",
      ],
    },
    keyPoints: [
      "Variável = nome + tipo + valor.",
      "int (inteiro), float (decimal), string (texto), bool (verdadeiro/falso).",
      "Em Python o tipo é inferido pelo valor; não precisa declarar.",
    ],
  },

  entrada_saida: {
    topicId: "entrada_saida",
    intro: "Um programa útil conversa com o usuário: recebe dados e devolve resultados.",
    sections: [
      {
        heading: "O modelo IPO",
        body: "Input (entrada) lê dados do usuário; Process (processamento) manipula esses dados; Output (saída) exibe o resultado. Quase todo programa segue esse fluxo.",
      },
      {
        heading: "Cuidado com input()",
        body: "Em Python, input() SEMPRE retorna texto (string). Para fazer contas você precisa converter com int() ou float(). Sem isso, '5' + '3' vira '53' (junta texto) em vez de 8.",
      },
    ],
    example: {
      title: "Somar dois números digitados",
      code: "a = int(input())   # lê e converte para inteiro\nb = int(input())\nsoma = a + b       # processamento\nprint(\"Soma:\", soma)  # saída",
      steps: [
        "int(input()) lê o que o usuário digita e converte de texto para número.",
        "soma = a + b processa os valores já convertidos.",
        "print exibe o resultado final.",
        "Se faltasse o int(), o + juntaria os textos em vez de somar.",
      ],
    },
    keyPoints: [
      "Siga o modelo IPO: Input → Process → Output.",
      "input() devolve string — converta com int()/float() para calcular.",
      "print() exibe a saída ao usuário.",
    ],
  },

  operadores: {
    topicId: "operadores",
    intro: "Operadores são os símbolos que fazem o programa calcular, comparar e decidir.",
    sections: [
      {
        heading: "Os três tipos",
        body: "Aritméticos (+, -, *, /, %) fazem cálculos. Relacionais (==, !=, >, <, >=, <=) comparam e retornam True/False. Lógicos (and, or, not) combinam condições booleanas.",
      },
      {
        heading: "A confusão clássica: == vs =",
        body: "= ATRIBUI um valor (x = 5 coloca 5 em x). == COMPARA (x == 5 pergunta se x vale 5). Em condicionais use sempre ==. E o operador % retorna o resto de uma divisão.",
      },
    ],
    example: {
      title: "Usando operadores",
      code: "x = 10\ny = 3\nprint(x + y)   # 13  -> soma (aritmético)\nprint(x % y)   # 1   -> resto (aritmético)\nprint(x > y)   # True -> comparação (relacional)",
      steps: [
        "x + y soma os valores: 13.",
        "x % y dá o resto de 10 dividido por 3, que é 1.",
        "x > y compara e retorna True, pois 10 é maior que 3.",
        "Note que comparações sempre produzem True ou False.",
      ],
    },
    keyPoints: [
      "Aritméticos calculam; relacionais comparam; lógicos combinam.",
      "= atribui, == compara — não confunda.",
      "% retorna o resto da divisão (útil para checar paridade).",
    ],
  },

  condicionais: {
    topicId: "condicionais",
    intro: "Para o programa tomar decisões — 'se isso, então aquilo' — usamos condicionais.",
    sections: [
      {
        heading: "if, else e elif",
        body: "O if avalia uma condição booleana: se for verdadeira, executa o bloco. O else cobre o caso falso. O elif testa condições adicionais em sequência. Os blocos são definidos por indentação.",
      },
      {
        heading: "Ordem importa",
        body: "Python avalia as condições de cima para baixo e PARA na primeira verdadeira. Por isso a ordem dos elif faz diferença — coloque as condições mais específicas primeiro.",
      },
    ],
    example: {
      title: "Classificar uma nota",
      code: "nota = 7\nif nota >= 9:\n    print(\"A\")\nelif nota >= 7:\n    print(\"B\")\nelse:\n    print(\"C\")",
      steps: [
        "nota >= 9? Não (7 não é ≥ 9). Passa adiante.",
        "nota >= 7? Sim (7 ≥ 7) → imprime 'B' e PARA.",
        "O else nem é avaliado, porque uma condição já foi satisfeita.",
        "Resultado: B.",
      ],
    },
    keyPoints: [
      "if executa se a condição for verdadeira; else cobre o caso falso.",
      "elif adiciona condições; a avaliação para na primeira verdadeira.",
      "Use == para comparar dentro do if (nunca =).",
    ],
  },

  repeticao: {
    topicId: "repeticao",
    intro: "Quando algo precisa ser repetido, em vez de copiar código usamos loops.",
    sections: [
      {
        heading: "for vs while",
        body: "Use for quando sabe quantas vezes repetir ou vai percorrer uma sequência. Use while quando o número de repetições depende de uma condição que muda durante a execução.",
      },
      {
        heading: "range e a condição de parada",
        body: "range(1, 5) gera 1, 2, 3, 4 (o fim é exclusivo!). Todo loop precisa de uma condição de parada — num while, esqueça de atualizar a variável de controle e você cria um loop infinito.",
      },
    ],
    example: {
      title: "Somar os números de 1 a 4",
      code: "soma = 0\nfor i in range(1, 5):   # i = 1, 2, 3, 4\n    soma = soma + i\nprint(soma)   # 10",
      steps: [
        "soma começa em 0 (acumulador).",
        "range(1, 5) gera 1, 2, 3, 4 — o 5 fica de fora.",
        "A cada volta, soma acumula: 1, depois 3, depois 6, depois 10.",
        "Ao terminar o loop, print mostra 10.",
      ],
    },
    keyPoints: [
      "for: número conhecido de repetições ou percorrer sequência.",
      "while: repete enquanto a condição for verdadeira.",
      "range(a, b) vai de a até b-1; cuidado com loop infinito.",
    ],
  },

  funcoes: {
    topicId: "funcoes",
    intro: "Para reaproveitar código e organizar o programa, agrupamos passos em funções.",
    sections: [
      {
        heading: "O que é uma função",
        body: "Função é um bloco de código reutilizável com nome. Define-se com def nome(parametros): e devolve um resultado com return. Escreva uma vez, chame quantas vezes quiser.",
      },
      {
        heading: "return não é print",
        body: "return DEVOLVE um valor para quem chamou a função (pode ser guardado numa variável). print só EXIBE na tela. Sem return, a função devolve None.",
      },
    ],
    example: {
      title: "Uma função que calcula o dobro",
      code: "def dobro(x):\n    return x * 2\n\nresultado = dobro(5)\nprint(resultado)   # 10",
      steps: [
        "def dobro(x): define a função com um parâmetro x.",
        "return x * 2 devolve o valor calculado para quem chamou.",
        "dobro(5) chama a função com argumento 5 → devolve 10.",
        "O 10 é guardado em resultado e depois exibido.",
      ],
    },
    keyPoints: [
      "Função = nome + parâmetros + corpo + return.",
      "Parâmetros são locais: só existem dentro da função.",
      "return devolve um valor; print apenas exibe.",
    ],
  },

  vetores: {
    topicId: "vetores",
    intro: "Para guardar vários valores numa só estrutura, usamos vetores (listas).",
    sections: [
      {
        heading: "O que é um vetor",
        body: "Vetor (lista em Python) é uma coleção ordenada de valores, indexada a partir de 0. Em [10, 20, 30], o índice 0 é o 10 e o índice 1 é o 20. v[-1] acessa o último.",
      },
      {
        heading: "Operações comuns",
        body: "len(v) retorna o tamanho; v.append(x) adiciona ao final; um for percorre todos os elementos. Acessar um índice que não existe gera erro (index out of bounds).",
      },
    ],
    example: {
      title: "Trabalhando com uma lista de notas",
      code: "notas = [7, 8, 9]\nprint(notas[0])   # 7  -> primeiro elemento\nnotas.append(10)  # adiciona ao final\nprint(len(notas)) # 4  -> agora tem 4 itens",
      steps: [
        "notas guarda três valores numa lista.",
        "notas[0] acessa o primeiro elemento (índice começa em 0) → 7.",
        "append(10) adiciona o 10 ao final da lista.",
        "len(notas) conta os elementos: agora são 4.",
      ],
    },
    keyPoints: [
      "Índices começam em 0; v[-1] é o último.",
      "len() dá o tamanho; append() adiciona ao final.",
      "Percorra com for; índice inválido gera erro.",
    ],
  },
};
