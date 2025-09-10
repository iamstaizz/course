import pandas
import numpy

def generate_random_matrix():
    numbers = numpy.random.permutation(numpy.arange(1, 101))
    df = pandas.DataFrame(numbers.reshape(10, 10), columns=[f"Стовпчик {i+1}" for i in range(10)])
    df.to_csv("random_numbers.csv", index=False)

def read_matrix():
    return pandas.read_csv("random_numbers.csv")

def add_sums(df):
    d = df.copy()
    d["Сума рядка"] = d.sum(axis=1)
    sums = d.sum(axis=0)
    sums["Сума рядка"] = sums[:-1].sum()
    d.loc["Сума стовпчика"] = sums
    return d

def find_multiples_of_5(df):
    res = []
    for i, row in df.iterrows():
        for j, val in enumerate(row):
            if val % 5 == 0:
                res.append((val, f"Рядок {i+1}", f"Стовпчик {j+1}"))
    return res

def find_number(df, number=42):
    for i, row in df.iterrows():
        for j, val in enumerate(row):
            if val == number:
                return f"Число {number} знаходиться: Рядок {i+1}, Стовпчик {j+1}"
    return f"Число {number} відсутнє"

def sort_and_save_excel(df):
    nums = df.values.flatten()
    sorted_nums = numpy.sort(nums).reshape(10, 10)
    d = pandas.DataFrame(sorted_nums, columns=[f"Стовпчик {i+1}" for i in range(10)])
    d.to_excel("sorted_matrix.xlsx", index=False)
    return d

def number_to_excel_letters(n):
    s = ""
    while n > 0:
        n -= 1
        s = chr(97 + (n % 26)) + s
        n //= 26
    return s

def replace_numbers_with_letters(df):
    letters_matrix = pandas.DataFrame(index=df.index, columns=df.columns, dtype=object)
    for i in range(df.shape[0]):
        for j in range(df.shape[1]):
            letters_matrix.iat[i, j] = number_to_excel_letters(df.iat[i, j])
    letters_matrix.to_csv("letters_matrix.csv", index=False)
    return letters_matrix

if __name__ == "__main__":
    generate_random_matrix()
    df = read_matrix()
    pandas.set_option("display.max_rows", None)
    pandas.set_option("display.max_columns", None)
    print("Початкова матриця:\n", df, "\n")
    print("Матриця з сумами:\n", add_sums(df), "\n")
    print("Числа, кратні 5:\n", find_multiples_of_5(df), "\n")
    print(find_number(df, 42), "\n")
    print("Відсортована матриця:\n", sort_and_save_excel(df), "\n")
    print("Матриця з літерами:\n", replace_numbers_with_letters(df), "\n")
