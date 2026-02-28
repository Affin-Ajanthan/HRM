package com.affin.hrm.Service;

import com.affin.hrm.DTO.LoginDTO;
import com.affin.hrm.DTO.UserDTO;
import com.affin.hrm.Model.User;
import com.affin.hrm.Repo.UserRepo;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@Transactional
public class UserService {

    @Autowired private UserRepo userRepo;
    @Autowired private ModelMapper modelMapper;

    public List<UserDTO> getAllUsers() {
        return modelMapper.map(userRepo.findAll(), new TypeToken<List<UserDTO>>() {}.getType());
    }

    public UserDTO getUserById(int userId) {
        return modelMapper.map(
                Objects.requireNonNull(userRepo.getUserById(userId), "User not found"),
                UserDTO.class);
    }

    public UserDTO saveUser(UserDTO userDTO) {
        userRepo.save(Objects.requireNonNull(modelMapper.map(userDTO, User.class)));
        return userDTO;
    }

    public UserDTO updateUser(UserDTO userDTO) {
        userRepo.save(Objects.requireNonNull(modelMapper.map(userDTO, User.class)));
        return userDTO;
    }

    public String deleteUser1(Integer userId) {
        userRepo.deleteById(userId);
        return "User deleted";
    }

    public String deleteUser2(UserDTO userDTO) {
        userRepo.delete(Objects.requireNonNull(modelMapper.map(userDTO, User.class)));
        return "User deleted";
    }

    public UserDTO loginUser(LoginDTO loginDTO) {
        Optional<User> userOptional = userRepo.findByEmail(loginDTO.getEmail());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (user.getPassword().equals(loginDTO.getPassword()))
                return modelMapper.map(user, UserDTO.class);
        }
        throw new RuntimeException("Invalid email or password");
    }
}
