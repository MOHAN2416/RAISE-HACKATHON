from mock_data import BANK_BALANCES, MONTHLY_BURN_RATE

def get_balances() -> dict:
    """Returns the current bank account balances."""
    return BANK_BALANCES

def calculate_surplus() -> float:
    """
    Determines investable surplus beyond the $500k policy threshold.
    Returns the total surplus amount available for investment.
    """
    total_balance = sum(BANK_BALANCES.values())
    # As per policy, maintain $500k in operating accounts.
    policy_threshold = 500000
    surplus = total_balance - policy_threshold
    return max(0.0, float(surplus))

def execute_sweep(amount: float, destination: str) -> dict:
    """
    Simulates sweeping funds and calculating resulting yield.
    destination could be "4% yield bonds".
    """
    # Simulate a 4% annual yield, calculated for a full year for simplicity
    annual_yield_rate = 0.04 
    if "4%" in destination or "yield bond" in destination.lower():
        pass # use 4%
    
    expected_annual_yield = amount * annual_yield_rate
    
    return {
        "status": "success",
        "swept_amount": amount,
        "destination": destination,
        "expected_annual_yield": expected_annual_yield
    }
