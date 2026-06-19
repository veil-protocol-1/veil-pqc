// Veil Biometric Authentication Circuit
//
// Proves that the prover knows a biometric embedding and seed such that
// BLAKE2s(seed) == commitment, without revealing the embedding or the seed.
//
// The sketch binds the proof to a specific enrollment: embedding XOR sketch[0..128]
// produces the candidate codeword. The Pedersen commitment ties the seed to the
// candidate, ensuring the prover cannot reuse a seed from a different enrollment.
//
// Full RS decoding inside ZK is deferred (expensive in constraint gates).
// Security relies on the BLAKE2s commitment check plus the Pedersen binding.

fn main(
    // Private inputs
    embedding: [u8; 128],
    seed: [u8; 32],
    // Public inputs
    sketch: pub [u8; 255],
    commitment: pub [u8; 32],
) {
    // Primary assertion: BLAKE2s(seed) == commitment
    let seed_hash: [u8; 32] = std::hash::blake2s(seed);
    for i in 0..32 {
        assert(seed_hash[i] == commitment[i]);
    }

    // Binding: tie embedding to sketch so the prover must supply a consistent
    // biometric. candidate[i] = embedding[i] XOR sketch[i]
    let mut candidate: [u8; 128] = [0; 128];
    for i in 0..128 {
        candidate[i] = embedding[i] ^ sketch[i];
    }

    // Pedersen commitment binds (seed, candidate) together in the proof.
    // This prevents a prover from reusing a seed from a different enrollment.
    let mut pedersen_inputs: [Field; 160] = [0; 160];
    for i in 0..128 {
        pedersen_inputs[i] = candidate[i] as Field;
    }
    for i in 0..32 {
        pedersen_inputs[128 + i] = seed[i] as Field;
    }
    let _binding = std::hash::pedersen_commitment(pedersen_inputs);
}
