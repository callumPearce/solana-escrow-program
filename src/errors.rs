/// Custom errors definitions for the program
use solana_program::program_error::ProgramError;
use thiserror::Error;

#[derive(Error, Debug, Copy, Clone)]
pub enum EscrowError {
    #[error("InvalidInstruction")]
    InvalidInstruction,
    #[error("NotRentExempt")]
    NotRentExempt,
    #[error("ExpectedAmountMismatch")]
    ExpectedAmountMismatch,
    #[error("AmountOverflow")]
    AmountOverflow
}

impl From<EscrowError> for ProgramError {
    fn from(e: EscrowError) -> Self {
        ProgramError::Custom(e as u32)
    }
}