def calculate_flames():

    name_01 = input("Enter the first person's name: ")
    name_02 = input("Enter the second person's name: ")

    common_letters = set(name_01.lower()) & set(name_02.lower())
    # Detect common letters and remove them from both names

    remaining_letters = (set(name_01.lower()) | set(name_02.lower())) - common_letters
    # Remaining letters after removing common letters

    # Calculate the number of remaining letters
    remaining_count = len(remaining_letters)

    FLAMES = ["Fubu", "Lover", "Affection", "Marriage", "Enemy", "Sibling"]

    # Count through the FLAMES word remaining_count times to determine the relationship
    i = 0
    while len(FLAMES) > 1:
        i = (i + remaining_count - 1) % len(FLAMES)
        FLAMES.pop(i)

    flames_result = FLAMES[0]  # The final remaining letter
    return flames_result

if __name__ == "__main__":
    result = calculate_flames()
    print(f"The relationship is: {result}")