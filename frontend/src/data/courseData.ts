export const courseModules = [
  {
    id: 1,
    title: "Fundamentos de Java",
    description: "Comprende qué es Java, cómo funciona su entorno y escribe tus primeros programas.",
    objectives: [
      "Instalar y configurar el entorno de desarrollo (JDK, JRE, IDE).",
      "Comprender la estructura básica de un programa en Java.",
      "Utilizar variables, tipos de datos y operadores matemáticos.",
      "Manejar entrada y salida de datos por consola."
    ],
    topics: [
      "¿Qué es Java? Usos y características",
      "Arquitectura de Java: JDK, JRE, JVM",
      "Estructura básica de un programa (clase main)",
      "Variables, Constantes y Tipos de datos",
      "Operadores lógicos y matemáticos",
      "Entrada/Salida (Scanner y System.out)"
    ],
    content: {
      theory: "Java es un lenguaje de programación de propósito general, concurrente, orientado a objetos y diseñado para tener tan pocas dependencias de implementación como sea posible. Su lema es 'Escribe una vez, ejecuta en cualquier lugar' (WORA), lo que significa que el código Java compilado puede ejecutarse en todas las plataformas que admiten Java sin necesidad de recompilación.\n\nPara empezar a programar en Java, es fundamental entender tres conceptos clave: La JVM (Máquina Virtual de Java) que ejecuta el código, el JRE (Entorno de Ejecución) que contiene las librerías necesarias, y el JDK (Kit de Desarrollo) que incluye el compilador y otras herramientas para nosotros, los programadores.\n\nEn este módulo aprenderemos la sintaxis básica, desde cómo declarar variables primitivas (int, double, boolean) hasta cómo pedirle información al usuario y mostrar resultados por la consola.",
      codeExample: `import java.util.Scanner;

public class HolaMundo {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        System.out.print("Ingresa tu nombre: ");
        String nombre = scanner.nextLine();
        
        System.out.println("¡Hola " + nombre + "! Bienvenido al mundo de Java.");
        
        scanner.close();
    }
}`,
      explanation: "Este programa ilustra la estructura básica: Todo el código vive dentro de una 'Clase' (HolaMundo) y la ejecución comienza en el método 'main'. Utilizamos la clase 'Scanner' para leer texto desde el teclado.",
      exercises: [
        "Crea un programa que solicite dos números y muestre la suma, resta, multiplicación y división de ambos.",
        "Escribe un código que calcule el área de un círculo pidiendo el radio al usuario (usa Math.PI)."
      ],
      practicalProject: "Construir una Calculadora en Java por consola que solicite datos de manera interactiva."
    }
  },
  {
    id: 2,
    title: "Control de flujo",
    description: "Aprende a tomar decisiones en tu código y a repetir acciones utilizando bucles.",
    objectives: [
      "Tomar decisiones en el código utilizando sentencias condicionales (if, switch).",
      "Implementar repeticiones con bucles (for, while, do-while).",
      "Manejar saltos de flujo (break, continue)."
    ],
    topics: [
      "Condicionales simples y anidados (if, else if, else)",
      "Sentencia Switch",
      "Operador Ternario",
      "Bucles for, while y do-while",
      "Buenas prácticas en anidamiento de código"
    ],
    content: {
      theory: "El control de flujo es lo que permite que nuestros programas sean dinámicos e inteligentes. En lugar de ejecutar línea por línea de arriba a abajo de manera rígida, podemos decirle a Java que 'salte' porciones de código o las 'repita' múltiples veces basado en ciertas condiciones lógicas.\n\nLas estructuras condicionales (if, else, switch) evalúan una expresión booleana (verdadero o falso) para decidir qué camino tomar. Por otro lado, los bucles (for, while, do-while) nos permiten iterar sobre secuencias o repetir tareas sin copiar y pegar código.\n\nUn buen dominio del control de flujo es esencial para construir algoritmos eficientes y limpios.",
      codeExample: `import java.util.Scanner;

public class Menu {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int opcion = 0;
        
        do {
            System.out.println("--- MENÚ ---");
            System.out.println("1. Saludar");
            System.out.println("2. Despedirse");
            System.out.println("3. Salir");
            System.out.print("Opción: ");
            opcion = sc.nextInt();
            
            switch (opcion) {
                case 1: System.out.println("¡Hola!"); break;
                case 2: System.out.println("¡Adiós!"); break;
                case 3: System.out.println("Saliendo..."); break;
                default: System.out.println("Opción inválida");
            }
        } while (opcion != 3);
        
        sc.close();
    }
}`,
      explanation: "Este código usa un bucle 'do-while' para mostrar un menú interactivamente hasta que el usuario decida salir. La sentencia 'switch' evalúa el número ingresado para disparar una acción específica de manera muy legible.",
      exercises: [
        "Escribe un programa que determine si un número ingresado es par o impar.",
        "Imprime los números del 1 al 100 utilizando un bucle for, pero omite los múltiplos de 5 (usa continue)."
      ],
      practicalProject: "Crear un menú interactivo avanzado que contenga validaciones y retorne al inicio si el usuario comete errores."
    }
  },
  {
    id: 3,
    title: "Métodos y Colecciones",
    description: "Descubre cómo modularizar tu código y trabajar con listas de datos.",
    objectives: [
      "Crear y utilizar métodos para organizar el código lógico.",
      "Entender parámetros, argumentos y valores de retorno.",
      "Trabajar con Arrays y Listas Dinámicas (ArrayList)."
    ],
    topics: [
      "Declaración de métodos y sobrecarga",
      "Métodos void vs con retorno",
      "Ámbito de variables",
      "Arrays unidimensionales y multidimensionales",
      "Manejo avanzado de Strings",
      "Uso de ArrayList para colecciones"
    ],
    content: {
      theory: "A medida que los programas crecen, escribir todo en el 'main' se vuelve insostenible. Los métodos nos permiten empaquetar lógica en bloques reutilizables que reciben información (parámetros) y entregan resultados (retornos).\n\nAdemás del código espagueti, otro gran problema es almacenar múltiples datos. Para ello usamos Colecciones. Los Arrays convencionales son de tamaño estático, mientras que las colecciones de la interfaz List (como ArrayList) crecen de forma dinámica a medida que agregas elementos.\n\nLa combinación de métodos y colecciones te permitirá diseñar programas mucho más robustos.",
      codeExample: `import java.util.ArrayList;

public class GestionDatos {
    public static void main(String[] args) {
        ArrayList<String> nombres = new ArrayList<>();
        nombres.add("Ana");
        nombres.add("Carlos");
        nombres.add("Luis");
        
        imprimirLista(nombres);
    }
    
    // Método separado para responsabilidad única
    public static void imprimirLista(ArrayList<String> lista) {
        System.out.println("Lista de estudiantes:");
        for (String item : lista) {
            System.out.println(" - " + item);
        }
    }
}`,
      explanation: "El método 'imprimirLista' aísla la lógica de impresión. Si el día de mañana queremos imprimir la lista en mayúsculas, solo modificamos este método y todos los lugares que lo llamen se actualizarán.",
      exercises: [
        "Crea un método que reciba un arreglo de enteros y retorne el valor máximo.",
        "Crea un programa que pida 5 palabras, las guarde en un ArrayList y las muestre ordenadas alfabéticamente."
      ],
      practicalProject: "Crear un gestor de tareas (To-Do List) en consola usando ArrayList."
    }
  },
  {
    id: 4,
    title: "Programación Orientada a Objetos",
    description: "Da el salto al paradigma más usado en la industria: POO.",
    objectives: [
      "Comprender el concepto de Objeto y Clase.",
      "Aplicar encapsulamiento mediante modificadores de acceso.",
      "Aprovechar la herencia y el polimorfismo."
    ],
    topics: [
      "Conceptos clave de POO (Clases, Objetos, Métodos)",
      "Constructores y la palabra clave 'this'",
      "Encapsulamiento, Getters y Setters",
      "Herencia (extends)",
      "Polimorfismo y @Override",
      "Composición de clases"
    ],
    content: {
      theory: "La POO cambia la forma de pensar en programación. En lugar de ver el código como una serie de pasos lógicos (programación estructurada), vemos el sistema como una colección de 'Objetos' interactuando entre sí. Cada objeto tiene 'Estado' (sus atributos o variables) y 'Comportamiento' (sus métodos).\n\nLos cuatro pilares de la POO son:\n1. Encapsulamiento: Ocultar el estado interno y obligar a usar métodos para interactuar.\n2. Abstracción: Exponer solo lo que es relevante.\n3. Herencia: Crear nuevas clases basadas en clases existentes.\n4. Polimorfismo: Una misma interfaz puede tomar diferentes formas.\n\nDominar la POO es el paso decisivo para convertirte en un desarrollador Java profesional.",
      codeExample: `class Persona {
    private String nombre; // Encapsulamiento

    public Persona(String nombre) {
        this.nombre = nombre;
    }
    
    public String getNombre() {
        return nombre;
    }
    
    public void saludar() {
        System.out.println("Hola, soy " + nombre);
    }
}

class Estudiante extends Persona {
    private String codigo;

    public Estudiante(String nombre, String codigo) {
        super(nombre);
        this.codigo = codigo;
    }

    @Override
    public void saludar() {
        System.out.println("Hola, soy estudiante. Mi código es " + codigo);
    }
}`,
      explanation: "Vemos cómo la clase Estudiante hereda de Persona. Gracias al polimorfismo (@Override), al llamar al método saludar(), el estudiante tiene su propio comportamiento especializado.",
      exercises: [
        "Modela una clase 'CuentaBancaria' que prohíba asignar saldos negativos.",
        "Crea una clase padre 'Vehiculo' y clases hijas 'Coche' y 'Moto' con comportamientos distintos."
      ],
      practicalProject: "Sistemas de cuentas bancarias interactivas con transferencias entre objetos."
    }
  },
  {
    id: 5,
    title: "Excepciones y Proyecto Final",
    description: "Crea software tolerante a fallos y consolida todos tus conocimientos.",
    objectives: [
      "Prevenir caídas de software mediante captura de excepciones.",
      "Aplicar principios de diseño limpio y separación de capas.",
      "Entregar un proyecto final funcional."
    ],
    topics: [
      "Excepciones Checked vs Unchecked",
      "Bloques try, catch, finally",
      "Lanzar excepciones (throw)",
      "Principios SOLID (Introducción)",
      "Refactorización y Clean Code"
    ],
    content: {
      theory: "El código no siempre se ejecuta en escenarios perfectos. Las bases de datos se caen, los archivos se borran y los usuarios introducen letras donde se esperan números. Las 'Excepciones' en Java nos permiten interceptar estos errores antes de que colapsen nuestra aplicación.\n\nEl manejo adecuado de errores, combinado con los principios de Clean Code (Código Limpio), diferencian a un programador novato de uno profesional.\n\nEn este módulo final, integrarás la Sintaxis, el Control de Flujo, las Colecciones y la POO para construir el proyecto que te otorgará la certificación del curso.",
      codeExample: `import java.util.Scanner;
import java.util.InputMismatchException;

public class ManejoErrores {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        try {
            System.out.print("Digita un número entero: ");
            int numero = sc.nextInt();
            System.out.println("El doble es: " + (numero * 2));
        } catch (InputMismatchException e) {
            System.out.println("¡Error Crítico! No has digitado un número válido.");
        } finally {
            System.out.println("Operación finalizada. Cerrando recursos...");
            sc.close();
        }
    }
}`,
      explanation: "Si el usuario digita 'Hola' en lugar de un número, el programa saltará de inmediato al bloque 'catch' sin detener la ejecución de manera violenta, mostrando el mensaje de error personalizado.",
      exercises: [
        "Escribe un método que divida dos números. Atrapa la excepción si el denominador es cero (ArithmeticException).",
        "Investiga cómo crear tus propias excepciones personalizadas."
      ],
      practicalProject: "Proyecto Final: Sistema Integral de Gestión de Estudiantes y Matrículas aplicando todas las tecnologías del curso."
    }
  }
];
